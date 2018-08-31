import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { Link } from 'react-router-dom'
import classnames from 'classnames'

import User from '../../models/User'
import Asset from '../../models/Asset'
import Logo from '../../components/Logo'
import ToggleButton from '../../components/ToggleButton'
import LegacyDropdownMenu from '../../components/LegacyDropdownMenu'
import DropdownMenu, {
  DropdownItem,
  DropdownGroup,
} from '../../components/DropdownMenu'
import Feedback from '../../components/Feedback'
import Developer from '../../components/Developer'
import Settings from '../../components/Settings'
import AssetCounter from './AssetCounter'

import {
  TUTORIAL_URL,
  FAQ_URL,
  RELEASE_URL,
} from '../../constants/themeDefaults'

import { equalSets } from '../../services/jsUtil'
import { createSimilarityWidget } from '../../models/Widget'
import fieldNamespaceToName from '../../services/fieldNamespaceToName'
import { assetsForIds } from '../../actions/assetsAction'

export default class Header extends Component {
  static propTypes = {
    sync: PropTypes.bool.isRequired,
    user: PropTypes.instanceOf(User).isRequired,
    isDeveloper: PropTypes.bool,
    isAdministrator: PropTypes.bool,
    monochrome: PropTypes.bool,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedIds: PropTypes.object,
    totalCount: PropTypes.number,
    loadedCount: PropTypes.number,
    assetFields: PropTypes.object,
    similarFields: PropTypes.instanceOf(Set),
    similarMinScore: PropTypes.object,
    userSettings: PropTypes.object.isRequired,
    archivistInfo: PropTypes.object,
    actions: PropTypes.shape({
      showModal: PropTypes.func.isRequired,
      hideModal: PropTypes.func.isRequired,
      selectAssetIds: PropTypes.func.isRequired,
      saveUserSettings: PropTypes.func.isRequired,
      dialogAlertPromise: PropTypes.func.isRequired,
      findSimilarFields: PropTypes.func.isRequired,
      resetRacetrackWidgets: PropTypes.func.isRequired,
      showPreferencesModal: PropTypes.func.isRequired,
      archivistInfo: PropTypes.func.isRequired,
    }),
    widgets: PropTypes.arrayOf(PropTypes.object),
    signoutUrl: PropTypes.string.isRequired,
    tutorialUrl: PropTypes.string.isRequired,
    releaseNotesUrl: PropTypes.string.isRequired,
    faqUrl: PropTypes.string.isRequired,
    supportUrl: PropTypes.string.isRequired,
  }

  state = {
    similarField: '',
    isSelectedHashValid: false,
    showHelpMenu: false,
  }

  componentWillMount() {
    if (!this.props.archivistInfo) {
      this.props.actions.archivistInfo()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.assetFields && !this.props.assetFields) {
      this.props.actions.findSimilarFields(nextProps.assetFields)
    }
    let similarField = this.state.similarField
    if (
      !similarField &&
      nextProps.similarFields &&
      nextProps.similarFields.size
    ) {
      similarField = [...nextProps.similarFields][0]
      this.lastSelectedIds = null
      this.setState({ similarField })
    }
    this.updateIsSelectedHashValid(nextProps.selectedIds, similarField)
  }

  updateIsSelectedHashValid(selectedIds, similarField) {
    if (
      similarField &&
      selectedIds &&
      !equalSets(this.lastSelectedIds, selectedIds)
    ) {
      this.lastSelectedIds = new Set(selectedIds)
      if (selectedIds.size) {
        assetsForIds(selectedIds, [similarField])
          .then(selectedAssets => {
            const selectedHashes = selectedAssets
              .map(asset => asset.rawValue(similarField))
              .filter(hash => hash && hash.length)
            const isSelectedHashValid = selectedHashes.length > 0
            this.setState({ isSelectedHashValid })
          })
          .catch(error => {
            console.log('Error getting selected asset hashes: ' + error)
          })
      } else {
        const isSelectedHashValid = false
        this.setState({ isSelectedHashValid })
      }
    } else if (!selectedIds || !selectedIds.size) {
      const isSelectedHashValid = false
      this.setState({ isSelectedHashValid })
    }
  }

  showPreferences = activePane => {
    const { actions } = this.props
    actions.showPreferencesModal(activePane)
  }

  showFeedback = () => {
    const { user, actions } = this.props
    const width = '460px'
    const body = <Feedback user={user} />
    actions.showModal({ body, width })
  }

  showDeveloper = () => {
    const width = '800px'
    const body = <Developer />
    this.props.actions.showModal({ body, width })
  }

  showSettings = () => {
    const width = '75vw'
    const body = <Settings />
    this.props.actions.showModal({ body, width })
  }

  deselectAll = () => {
    this.props.actions.selectAssetIds(null)
  }

  sortSimilar = () => {
    const { similarField } = this.state
    if (!similarField) return

    const { selectedIds, similarMinScore } = this.props
    const widgets = [...this.props.widgets]
    const index =
      widgets && widgets.findIndex(widget => widget.field === similarField)
    const oldWidget = widgets && index >= 0 && widgets[index]
    const isEnabled = true
    const isPinned = false
    const minScore = similarMinScore[similarField] || 75
    const oldFilter =
      oldWidget &&
      oldWidget.sliver &&
      oldWidget.sliver.filter &&
      oldWidget.sliver.filter.similarity[oldWidget.field]
    const oldHashes = oldFilter && oldFilter.hashes
    const hashes = [...selectedIds].map(id => {
      const oldHash = oldHashes && oldHashes.find(hash => hash.hash === id)
      if (oldHash) return oldHash
      return { hash: id, weight: 1 }
    })
    const widget = createSimilarityWidget(
      similarField,
      null,
      hashes,
      minScore,
      isEnabled,
      isPinned,
    )
    if (index < 0) {
      widgets.push(widget)
    } else {
      widgets[index] = widget
    }
    this.props.actions.resetRacetrackWidgets(widgets)
  }

  selectSimilarField = similarField => {
    if (similarField !== this.state.similarField) {
      this.lastSelectedIds = null
      this.updateIsSelectedHashValid(this.props.selectedIds, similarField)
      this.setState({ similarField })
    }
  }

  renderSimilar = () => {
    const { similarField, isSelectedHashValid } = this.state
    const { selectedIds, similarFields, widgets } = this.props

    const displayIcon = field => {
      if (!field || !field.length) return ''
      const name = fieldNamespaceToName(field).toLowerCase()
      if (name.startsWith('image')) return 'icon-picture2'
      if (name.includes('hue')) return 'icon-eyedropper'
      if (
        [
          'hue',
          'saturation',
          'luminance',
          'lightness',
          'rgb',
          'lab',
          'hsv',
          'hsl',
          'color',
        ].some(colorHint => name.includes(colorHint))
      ) {
        return 'icon-eyedropper'
      }
      if (name.includes('face')) return 'icon-group'
      return 'icon-similarity'
    }

    const similarActive = similarField && selectedIds
    const widget =
      widgets && widgets.find(widget => widget.field === similarField)
    const filter =
      similarField &&
      widget &&
      widget.sliver &&
      widget.sliver.filter &&
      widget.sliver.filter.similarity &&
      widget.sliver.filter.similarity[similarField]
    const hashes = filter && filter.hashes
    const similarAssetIds = hashes ? hashes.map(hash => hash.hash) : []
    const similarValuesSelected =
      similarActive &&
      selectedIds &&
      equalSets(new Set(similarAssetIds), selectedIds)

    // Only enable similar button if selected assets have the right hash
    const canSortSimilar =
      similarFields &&
      similarFields.size &&
      similarField &&
      similarField.length > 0 &&
      !similarValuesSelected &&
      isSelectedHashValid
    const sortSimilar = canSortSimilar ? this.sortSimilar : null

    return (
      <div className="Editbar-similar-section">
        <div
          className={classnames('Editbar-similar', {
            selected: similarActive,
            disabled: !canSortSimilar,
          })}
          onClick={sortSimilar}
          title="Find similar assets">
          <div
            className={`Editbar-similar-icon ${displayIcon(similarField)}`}
          />
          Similar
        </div>
        {similarFields &&
          similarFields.size > 1 && (
            <LegacyDropdownMenu>
              {[...similarFields].map(field => (
                <div
                  className="Editbar-similar-menu-item"
                  key={field}
                  onClick={_ => this.selectSimilarField(field)}
                  title={field}>
                  <div
                    className={`Editbar-similar-menu-item-selected${
                      similarField === field ? ' icon-check' : ''
                    }`}
                  />
                  <div
                    className={`Editbar-similar-icon ${displayIcon(field)}`}
                  />
                  <div className="Editbar-similar-menu-item-label">
                    {fieldNamespaceToName(field)}
                  </div>
                </div>
              ))}
            </LegacyDropdownMenu>
          )}
      </div>
    )
  }

  openTutorialUrl = () => {
    window.open(this.props.tutorialUrl || TUTORIAL_URL)
  }

  openfaqUrl = () => {
    window.open(this.props.faqUrl || FAQ_URL)
  }

  openReleaseNotesUrl = () => {
    window.open(this.props.releaseNotesUrl || RELEASE_URL)
  }

  openSupportUrl = () => {
    window.open(this.props.supportUrl)
  }

  toggleUserMenu = isOpen => {
    this.setState({
      showUserMenu: isOpen,
    })
  }

  toggleHelpMenu = isOpen => {
    this.setState({
      showHelpMenu: isOpen,
    })
  }

  logout = () => {
    window.location = this.props.signoutUrl
  }

  getAssetsString(selectedIds) {
    const selectedCount = selectedIds ? selectedIds.size : 0
    const pluralizable = selectedCount === 1 ? 'asset' : 'assets'
    return `${selectedCount.toLocaleString()} ${pluralizable}`
  }

  showSelectedAssets() {
    const { selectedIds } = this.props
    const nAssetsSelected = selectedIds ? selectedIds.size : 0
    const disabledSelected = !selectedIds || !selectedIds.size

    return (
      <div
        className={classnames('Editbar-selected', {
          disabled: disabledSelected,
        })}>
        {nAssetsSelected ? `${this.getAssetsString(selectedIds)} selected` : ''}
        {nAssetsSelected ? (
          <div
            onClick={this.deselectAll}
            className={classnames('Editbar-cancel', 'icon-cancel-circle', {
              disabledSelected,
            })}
          />
        ) : null}
      </div>
    )
  }

  render() {
    const {
      sync,
      user,
      isDeveloper,
      isAdministrator,
      totalCount,
      loadedCount,
      monochrome,
    } = this.props
    const loader = require('./loader-rolling.svg')
    const syncer = sync ? (
      <div className="Header-loading sync" />
    ) : (
      <img className="Header-loading" src={loader} />
    )

    return (
      <nav className="header flexOff flexCenter fullWidth">
        <Link to="/" className="header-logo">
          <Logo dark={monochrome} />
        </Link>
        {syncer}
        <div className="header-asset-counter">
          <AssetCounter
            total={totalCount}
            collapsed={0}
            loaded={loadedCount || 0}
          />
        </div>
        {this.showSelectedAssets()}
        <div className="flexOn" />
        {this.renderSimilar()}
        <div className="header-menu-bar fullHeight flexCenter">
          <div className="header-menu">
            <ToggleButton onClick={this.toggleHelpMenu}>Help</ToggleButton>
            {this.state.showHelpMenu && (
              <div className="header-menu-container">
                <DropdownMenu>
                  <DropdownGroup>
                    <DropdownItem onClick={this.openfaqUrl}>FAQ</DropdownItem>
                    <DropdownItem onClick={this.openReleaseNotesUrl}>
                      Release Notes
                    </DropdownItem>
                    <DropdownItem onClick={this.openTutorialUrl}>
                      Tutorials
                    </DropdownItem>
                  </DropdownGroup>
                  <DropdownGroup>
                    {this.props.supportUrl && (
                      <DropdownItem onClick={this.openSupportUrl}>
                        Support
                      </DropdownItem>
                    )}
                    <DropdownItem onClick={this.showFeedback}>
                      Send Feedback
                    </DropdownItem>
                  </DropdownGroup>
                </DropdownMenu>
              </div>
            )}
          </div>
          <div className="header-menu">
            <span className="header-menu-icon icon-zorroa-person-06" />
            <ToggleButton onClick={this.toggleUserMenu}>
              {user.username}
            </ToggleButton>
            {this.state.showUserMenu && (
              <div className="header-menu-container header-menu-container--user">
                <DropdownMenu>
                  <DropdownGroup>
                    <DropdownItem
                      onClick={() => {
                        this.showPreferences('general')
                      }}>
                      Preferences
                    </DropdownItem>
                  </DropdownGroup>
                  {(isDeveloper || isAdministrator) && (
                    <DropdownGroup>
                      {isDeveloper && (
                        <DropdownItem onClick={this.showDeveloper}>
                          Developer
                        </DropdownItem>
                      )}
                      {isAdministrator && (
                        <DropdownItem
                          onClick={() => {
                            this.showPreferences('user')
                          }}>
                          User Admin
                        </DropdownItem>
                      )}
                      {(isAdministrator || isDeveloper) && (
                        <DropdownItem onClick={this.showSettings}>
                          Archivist Settings
                        </DropdownItem>
                      )}
                    </DropdownGroup>
                  )}
                  <DropdownGroup>
                    <DropdownItem onClick={this.logout}>Logout</DropdownItem>
                  </DropdownGroup>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {/* this is stupid/ugly, but neede to keep sidebar & header logo widths in sync */}
        <div className="header-padding" style={{ width: '22px' }} />
      </nav>
    )
  }
}
