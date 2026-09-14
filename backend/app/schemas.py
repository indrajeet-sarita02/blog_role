from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class IsoDateTime(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if v is None:
            return None
        if isinstance(v, datetime):
            return cls(v.strftime('%Y-%m-%dT%H:%M:%S.000Z'))
        if isinstance(v, str):
            return cls(v)
        return cls(str(v))


class BaseSchema(BaseModel):
    class Config:
        orm_mode = True


class RoleBrief(BaseSchema):
    id: int
    name: str
    slug: str


class PermissionBrief(BaseSchema):
    id: int
    name: str
    slug: str
    module: str
    description: Optional[str] = None


class PermissionData(PermissionBrief):
    createdAt: IsoDateTime
    updatedAt: Optional[IsoDateTime] = None


class RoleWithPermissions(BaseSchema):
    id: int
    name: str
    slug: str
    permissions: List[PermissionBrief] = []


class UserAuthBrief(BaseSchema):
    id: int
    name: str
    email: str


class UserPublic(BaseSchema):
    id: int
    name: str
    email: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    status: str
    createdAt: IsoDateTime


class UserList(UserPublic):
    roles: List[RoleBrief] = []


class MeUser(UserPublic):
    roles: List[RoleWithPermissions] = []


class UserProfile(BaseSchema):
    id: int
    name: str
    email: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    status: str
    emailVerifiedAt: Optional[IsoDateTime] = None
    lastLoginAt: Optional[IsoDateTime] = None
    createdAt: IsoDateTime
    updatedAt: Optional[IsoDateTime] = None


class RoleData(BaseSchema):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    isSystem: bool = False
    createdAt: IsoDateTime
    updatedAt: Optional[IsoDateTime] = None


class RoleDetail(RoleData):
    permissions: List[PermissionBrief] = []


class CategoryBrief(BaseSchema):
    id: int
    name: str
    slug: str


class CategoryList(BaseSchema):
    id: int
    parentId: Optional[int] = None
    name: str
    slug: str
    description: Optional[str] = None
    status: Optional[str] = 'active'
    children: List[CategoryBrief] = []


class CategoryDetail(CategoryList):
    parent: Optional[CategoryBrief] = None


class CategoryFull(BaseSchema):
    id: int
    parentId: Optional[int] = None
    name: str
    slug: str
    description: Optional[str] = None
    status: Optional[str] = None
    createdAt: IsoDateTime
    updatedAt: Optional[IsoDateTime] = None


class TagBrief(BaseSchema):
    id: int
    name: str
    slug: str


class TagData(TagBrief):
    createdAt: IsoDateTime
    updatedAt: Optional[IsoDateTime] = None


class PostData(BaseSchema):
    id: int
    authorId: int
    categoryId: Optional[int] = None
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: Optional[str] = None
    featuredImage: Optional[str] = None
    status: str
    visibility: str
    publishedAt: Optional[IsoDateTime] = None
    createdAt: IsoDateTime
    updatedAt: Optional[IsoDateTime] = None
    author: Optional[UserAuthBrief] = None
    category: Optional[CategoryBrief] = None
    tags: List[TagBrief] = []


class PostLite(BaseSchema):
    id: int
    title: str
    slug: str


class CommentUserBrief(BaseSchema):
    id: int
    name: str
    avatar: Optional[str] = None


class CommentData(BaseSchema):
    id: int
    postId: int
    userId: int
    parentId: Optional[int] = None
    content: str
    status: str
    createdAt: IsoDateTime
    user: Optional[CommentUserBrief] = None


class CommentListData(CommentData):
    post: Optional[PostLite] = None


class MediaData(BaseSchema):
    id: int
    userId: int
    fileName: str
    originalName: str
    mimeType: str
    fileSize: int
    url: str
    altText: Optional[str] = None
    createdAt: IsoDateTime


class NotificationData(BaseSchema):
    id: int
    userId: int
    type: str
    title: str
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    readAt: Optional[IsoDateTime] = None
    createdAt: IsoDateTime
    updatedAt: Optional[IsoDateTime] = None


class AuditData(BaseSchema):
    id: int
    userId: Optional[int] = None
    action: str
    module: str
    entityType: Optional[str] = None
    entityId: Optional[int] = None
    oldValues: Optional[Any] = None
    newValues: Optional[Any] = None
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None
    createdAt: IsoDateTime


class PostRevisionData(BaseSchema):
    id: int
    postId: int
    userId: int
    title: str
    excerpt: Optional[str] = None
    content: Optional[str] = None
    featuredImage: Optional[str] = None
    revisionNumber: int
    createdAt: IsoDateTime