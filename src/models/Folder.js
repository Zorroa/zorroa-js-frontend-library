import AclEntry, { hasAccess, isPublic } from './Acl'
import User from './User'
import AssetSearch from './AssetSearch'

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
      this.name = json.name
      this.user = json.user && new User(json.user)
      this.timeCreated = json.timeCreated
      this.timeModified = json.timeModified
      this.recursive = json.recursive
      this.dyhiRoot = json.dyhiRoot
      this.acl = json.acl && json.acl.map(entry => (new AclEntry(entry)))
      this.search = json.search && new AssetSearch(json.search)
      this.childIds = null // set of childIds.
    }
  }

  isDyhi () {
    return this.dyhiId || this.dyhiRoot
  }

  isSmartCollection () {
    return this.search && !this.search.empty() && !this.isDyhi()
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
    for (let permission of user.permissions) {
      if (hasAccess(this.acl, permission, access)) return true
    }
    return false
  }

  isDroppableType (dragFolder) {
    if (!dragFolder) return false
    if (dragFolder.isDyhi() || this.isDyhi()) return false
    if (dragFolder.isSmartCollection() !== this.isSmartCollection()) return false
    return true
  }

  canDropFolderIds (draggedFolderIds, folders, user) {
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

  canDropAssetIds (draggedAssetIds, assets, user) {
    if (!draggedAssetIds || !draggedAssetIds.length || !assets || !user) return false
    if (!this.hasAccess(user, AclEntry.WriteAccess)) return false

    // Find at least one folder without one asset
    const folderIds = new Set([this.id])
    for (let i = 0; i < draggedAssetIds.length; ++i) {
      const id = draggedAssetIds[i]
      const dropAsset = assets.find(asset => (asset.id === id))
      if (!dropAsset.memberOfAllFolderIds(folderIds)) return true
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
