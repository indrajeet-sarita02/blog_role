from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


def utcnow():
    return datetime.utcnow()


class UserRole(Base):
    __tablename__ = 'user_roles'
    __table_args__ = (UniqueConstraint('user_id', 'role_id'),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column('user_id', Integer, ForeignKey('users.id'), nullable=False)
    roleId = Column('role_id', Integer, ForeignKey('roles.id'), nullable=False)
    createdAt = Column('created_at', DateTime, nullable=False, default=utcnow)


class RolePermission(Base):
    __tablename__ = 'role_permissions'
    __table_args__ = (UniqueConstraint('role_id', 'permission_id'),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    roleId = Column('role_id', Integer, ForeignKey('roles.id'), nullable=False)
    permissionId = Column('permission_id', Integer, ForeignKey('permissions.id'), nullable=False)
    createdAt = Column('created_at', DateTime, nullable=False, default=utcnow)

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    passwordHash = Column('password_hash', String(255), nullable=False)
    avatar = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    status = Column(Text, nullable=False, default='active')
    emailVerifiedAt = Column('email_verified_at', DateTime, nullable=True)
    lastLoginAt = Column('last_login_at', DateTime, nullable=True)
    createdAt = Column('created_at', DateTime, nullable=False, default=utcnow)
    updatedAt = Column('updated_at', DateTime, nullable=False, default=utcnow, onupdate=utcnow)
    deletedAt = Column('deleted_at', DateTime, nullable=True)

    roles = relationship('Role', secondary='user_roles', back_populates='users')


class Role(Base):
    __tablename__ = 'roles'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    isSystem = Column('is_system', Boolean, nullable=False, default=False)
    createdAt = Column('created_at', DateTime, nullable=False, default=utcnow)
    updatedAt = Column('updated_at', DateTime, nullable=False, default=utcnow, onupdate=utcnow)

    users = relationship('User', secondary='user_roles', back_populates='roles')
    permissions = relationship('Permission', secondary='role_permissions', back_populates='roles')


class Permission(Base):
    __tablename__ = 'permissions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, unique=True)
    module = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    createdAt = Column('created_at', DateTime, nullable=False, default=utcnow)
    updatedAt = Column('updated_at', DateTime, nullable=False, default=utcnow, onupdate=utcnow)

    roles = relationship('Role', secondary='role_permissions', back_populates='permissions')


class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, autoincrement=True)
    parentId = Column('parent_id', Integer, ForeignKey('categories.id'), nullable=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default='active')
    createdAt = Column('created_at', DateTime, nullable=False, default=utcnow)
    updatedAt = Column('updated_at', DateTime, nullable=False, default=utcnow, onupdate=utcnow)

    parent = relationship('Category', remote_side=[id], back_populates='children')
    children = relationship('Category', back_populates='parent')


class Tag(Base):
    __tablename__ = 'tags'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, unique=True)
    createdAt = Column('created_at', DateTime, nullable=False, default=utcnow)
    updatedAt = Column('updated_at', DateTime, nullable=False, default=utcnow, onupdate=utcnow)

    posts = relationship('Post', secondary='post_tags', back_populates='tags')


class Post(Base):
    __tablename__ = 'posts'

    id = Column(Integer, primary_key=True, autoincrement=True)
    authorId = Column('author_id', Integer, ForeignKey('users.id'), nullable=False)
    categoryId = Column('category_id', Integer, ForeignKey('categories.id'), nullable=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    featuredImage = Column('featured_image', String(255), nullable=True)
    status = Column(Text, nullable=False, default='draft')
    visibility = Column(Text, nullable=False, default='public')
    publishedAt = Column('published_at', DateTime, nullable=True)
    createdAt = Column('created_at', DateTime, nullable=False, default=utcnow)
    updatedAt = Column('updated_at', DateTime, nullable=False, default=utcnow, onupdate=utcnow)
    deletedAt = Column('deleted_at', DateTime, nullable=True)

    author = relationship('User', foreign_keys=[authorId])
    category = relationship('Category', foreign_keys=[categoryId])
    tags = relationship('Tag', secondary='post_tags', back_populates='posts')
    revisions = relationship('PostRevision', back_populates='post')


class PostTag(Base):
    __tablename__ = 'post_tags'

    postId = Column('post_id', Integer, ForeignKey('posts.id'), primary_key=True)
    tagId = Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
    createdAt = Column('created_at', DateTime, nullable=False, default=utcnow)


class PostRevision(Base):
    __tablename__ = 'post_revisions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    postId = Column('post_id', Integer, ForeignKey('posts.id'), nullable=False)
    userId = Column('user_id', Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String(255), nullable=False)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    featuredImage = Column('featured_image', String(255), nullable=True)
    revisionNumber = Column('revision_number', Integer, nullable=False)
    createdAt = Column('created_at', DateTime, nullable=False, default=utcnow)

    post = relationship('Post', back_populates='revisions')


class Comment(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True, autoincrement=True)
    postId = Column('post_id', Integer, ForeignKey('posts.id'), nullable=False)
    userId = Column('user_id', Integer, ForeignKey('users.id'), nullable=False)
    parentId = Column('parent_id', Integer, ForeignKey('comments.id'), nullable=True)
    content = Column(Text, nullable=False)
    status = Column(Text, nullable=False, default='pending')
    createdAt = Column('created_at', DateTime, nullable=False, default=utcnow)
    updatedAt = Column('updated_at', DateTime, nullable=False, default=utcnow, onupdate=utcnow)
    deletedAt = Column('deleted_at', DateTime, nullable=True)

    user = relationship('User', foreign_keys=[userId])
    post = relationship('Post', foreign_keys=[postId])
    parent = relationship('Comment', remote_side=[id], back_populates='replies')
    replies = relationship('Comment', back_populates='parent')


class Media(Base):
    __tablename__ = 'media'

    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column('user_id', Integer, ForeignKey('users.id'), nullable=False)
    fileName = Column('file_name', String(255), nullable=False)
    originalName = Column('original_name', String(255), nullable=False)
    mimeType = Column('mime_type', String(100), nullable=False)
    fileSize = Column('file_size', BigInteger, nullable=False)
    storagePath = Column('storage_path', String(255), nullable=False)
    url = Column(String(255), nullable=False)
    altText = Column('alt_text', String(255), nullable=True)
    createdAt = Column('created_at', DateTime, nullable=False, default=utcnow)
    updatedAt = Column('updated_at', DateTime, nullable=False, default=utcnow, onupdate=utcnow)
    deletedAt = Column('deleted_at', DateTime, nullable=True)

    user = relationship('User', foreign_keys=[userId])


class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column('user_id', Integer, ForeignKey('users.id'), nullable=True)
    action = Column(String(100), nullable=False)
    module = Column(String(50), nullable=False)
    entityType = Column('entity_type', String(50), nullable=True)
    entityId = Column('entity_id', Integer, nullable=True)
    oldValues = Column('old_values', JSON, nullable=True)
    newValues = Column('new_values', JSON, nullable=True)
    ipAddress = Column('ip_address', String(45), nullable=True)
    userAgent = Column('user_agent', String(500), nullable=True)
    createdAt = Column('created_at', DateTime, nullable=False, default=utcnow)


class Notification(Base):
    __tablename__ = 'notifications'

    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column('user_id', Integer, ForeignKey('users.id'), nullable=False)
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    data = Column(JSON, nullable=True)
    readAt = Column('read_at', DateTime, nullable=True)
    createdAt = Column('created_at', DateTime, nullable=False, default=utcnow)
    updatedAt = Column('updated_at', DateTime, nullable=False, default=utcnow, onupdate=utcnow)


class Setting(Base):
    __tablename__ = 'settings'

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String(100), nullable=False, unique=True)
    value = Column(JSON, nullable=False)
    createdAt = Column('created_at', DateTime, nullable=False, default=utcnow)
    updatedAt = Column('updated_at', DateTime, nullable=False, default=utcnow, onupdate=utcnow)