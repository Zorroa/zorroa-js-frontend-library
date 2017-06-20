import AclEntry, { hasAccess, isPublic } from './Acl'
import User from './User'
import AssetSearch from './AssetSearch'
import Permission from './Permission'

export default class Folder {
  static ROOT_ID = 0

  static Filters = {
    browsing: folder => { return folder.isDyhi() },
    smart: folder => { return !folder.isDyhi() && folder.search },
    simple: folder => { return !folder.isDyhi() && !folder.search }
  }

  constructor (json) {
    if (json) {
      this.id = json.id
      this.parentId = json.parentId
      this.dyhiId = json.dyhiId
      this.name = json.name || '(none)'
      this.user = json.user && new User(json.user)
      this.timeCreated = json.timeCreated
      this.timeModified = json.timeModified
      this.recursive = json.recursive
      this.dyhiRoot = json.dyhiRoot
      this.acl = json.acl && json.acl.map(entry => (new AclEntry(entry)))
      this.search = json.search && new AssetSearch(json.search)
      this.childCount = json.childCount   // server-managed

      this.childIds = null // client-created set of childIds in reducer
    }
  }

  isDyhi () {
    return this.dyhiId || this.dyhiRoot
  }

  isSmartCollection () {
    return this.search && (this.search.aggs || !this.search.empty()) && !this.isDyhi()
  }

  isSimpleCollection () {
    return !this.isDyhi() && !this.isSmartCollection()
  }

  isPrivate (user, userPermissions) {
    return !this.isPublic(user, userPermissions)
  }

  isPublic (user, userPermissions) {
    return isPublic(this.acl, user, userPermissions)
  }

  hasAccess (user, access) {
    if (this.user && user && this.user.id === user.id) return true
    if (!user.permissions) return false
    let isAdministrator = false
    for (let permission of user.permissions) {
      if (permission.type === Permission.GroupType &&
        permission.name === Permission.Administrator) isAdministrator = true
      if (hasAccess(this.acl, permission, access)) return true
    }
    if (isAdministrator) return true
    return false
  }

  isDroppableType (dragFolder) {
    if (!dragFolder) return false
    if (dragFolder.dyhiId && !dragFolder.dyhiRoot) return false  // Dyhi child
    if (this.isDyhi()) return false             // Can't drop onto a dyhi of any type
    if (this.isSmartCollection()) return false  // Can't drop onto smart (forced simplification)
    return true
  }

  canAddChildFolderIds (draggedFolderIds, folders, user) {
    if (this.isDyhi()) return false
    if (this.isSmartCollection()) return false
    if (draggedFolderIds instanceof Set) draggedFolderIds = [...draggedFolderIds]
    if (!draggedFolderIds || !draggedFolderIds.length || !folders || !user) return false

    // Find at least one droppable folder
    for (let i = 0; i < draggedFolderIds.length; ++i) {
      const id = draggedFolderIds[i]
      const dropFolder = folders.get(id)
      if (this.id !== dropFolder.parentId &&          // Current parent?
        this.isDroppableType(dropFolder, user) &&     // Same species?
        this.hasAccess(user, AclEntry.WriteAccess) && // User permissions
        !isAncestor(id, this.id, folders)) {          // Avoid recursion & self
        return true
      }
    }
    return false
  }

  canAddAssetIds (draggedAssetIds, assets, user) {
    if (draggedAssetIds instanceof Set) draggedAssetIds = [...draggedAssetIds]
    if (!draggedAssetIds || !draggedAssetIds.length || !assets || !user) return false
    if (!this.hasAccess(user, AclEntry.WriteAccess)) return false

    // Find at least one folder without one asset
    const folderIds = new Set([this.id])
    for (let i = 0; i < draggedAssetIds.length; ++i) {
      const id = draggedAssetIds[i]
      const dropAsset = assets.find(asset => (asset.id === id))
      if (dropAsset && !dropAsset.memberOfAllFolderIds(folderIds)) return true
    }
    return false
  }
}

// is the parent ancestor of child? Requires on state.folders.all
export function isAncestor (parentId, childId, folders) {
  if (!parentId || !childId) return false
  if (parentId === Folder.ROOT_ID || childId === Folder.ROOT_ID) return false
  if (parentId === childId) return true
  return isAncestor(parentId, folders.get(childId).parentId, folders)
}
