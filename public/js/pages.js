/* =============================================
   VIBE — Page Renderers
   Auth, Feed, Profile, Post Detail, Explore
   ============================================= */

const Pages = {

    // ─────────────────────────────────────
    //  AUTH (Login / Register)
    // ─────────────────────────────────────
    auth(mode) {
        const isLogin = mode === 'login';
        return `
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <span class="logo-icon">◈</span>
            <h1>${isLogin ? 'Welcome back' : 'Join Vibe'}</h1>
            <p>${isLogin ? 'Sign in to continue your journey' : 'Create your account and start sharing'}</p>
          </div>
          <div class="auth-error" id="auth-error"></div>
          <form id="auth-form">
            ${!isLogin ? `
              <div class="form-group">
                <label>Email</label>
                <input type="email" class="form-input" id="auth-email" placeholder="you@example.com" required>
              </div>
            ` : ''}
            <div class="form-group">
              <label>Username</label>
              <input type="text" class="form-input" id="auth-username" placeholder="Enter your username" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" class="form-input" id="auth-password" placeholder="${isLogin ? 'Enter your password' : 'Min 6 characters'}" required>
            </div>
            <button type="submit" class="btn btn-primary btn-full" id="auth-submit">
              ${isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          <div class="auth-toggle">
            ${isLogin
                ? 'Don\'t have an account? <a href="#/register">Sign up</a>'
                : 'Already have an account? <a href="#/login">Sign in</a>'}
          </div>
        </div>
      </div>
    `;
    },

    bindAuth(mode) {
        const form = document.getElementById('auth-form');
        const errorEl = document.getElementById('auth-error');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorEl.style.display = 'none';

            const username = document.getElementById('auth-username').value.trim();
            const password = document.getElementById('auth-password').value;

            try {
                let data;
                if (mode === 'login') {
                    data = await App.post('/api/auth/login', { username, password });
                } else {
                    const email = document.getElementById('auth-email').value.trim();
                    data = await App.post('/api/auth/register', { username, email, password });
                }
                App.currentUser = data.user;
                App.toast(`Welcome${mode === 'login' ? ' back' : ''}, ${data.user.display_name}!`);
                window.location.hash = '#/feed';
            } catch (err) {
                errorEl.textContent = err.message;
                errorEl.style.display = 'block';
            }
        });
    },

    // ─────────────────────────────────────
    //  FEED
    // ─────────────────────────────────────
    async renderFeed(container) {
        const data = await App.get('/api/posts/feed');
        const posts = data.posts;

        container.innerHTML = `
      <h1 class="page-title">Your Feed</h1>
      <div class="create-post">
        <form class="create-post-form" id="create-post-form">
          <textarea id="post-content" placeholder="What's on your mind?" maxlength="1000"></textarea>
          <div class="create-post-actions">
            <button type="submit" class="btn btn-primary">Post</button>
          </div>
        </form>
      </div>
      <div id="posts-container">
        ${posts.length === 0
                ? `<div class="empty-state">
              <div class="empty-state-icon">📮</div>
              <h3>Your feed is empty</h3>
              <p>Follow some people or create your first post!</p>
            </div>`
                : posts.map(p => this.postCard(p)).join('')
            }
      </div>
    `;

        // Bind create post
        document.getElementById('create-post-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = document.getElementById('post-content').value.trim();
            if (!content) return;

            try {
                const data = await App.post('/api/posts', { content });
                document.getElementById('post-content').value = '';
                const container = document.getElementById('posts-container');
                // Remove empty state if present
                const emptyState = container.querySelector('.empty-state');
                if (emptyState) emptyState.remove();
                container.insertAdjacentHTML('afterbegin', this.postCard(data.post));
                this.bindPostActions(data.post.id);
                App.toast('Post published!');
            } catch (err) {
                App.toast(err.message, 'error');
            }
        });

        // Bind existing post actions
        posts.forEach(p => this.bindPostActions(p.id));
    },

    // ─────────────────────────────────────
    //  POST CARD
    // ─────────────────────────────────────
    postCard(post) {
        const isOwn = App.currentUser && post.user_id === App.currentUser.id;
        return `
      <div class="post-card" id="post-${post.id}">
        <div class="post-header">
          ${App.getAvatarHTML(post)}
          <div class="post-user-info">
            <span class="display-name" onclick="window.location.hash='#/profile/${post.user_id}'">${this.esc(post.display_name || post.username)}</span>
            <div><span class="username">@${this.esc(post.username)}</span> · <span class="post-time">${App.timeAgo(post.created_at)}</span></div>
          </div>
        </div>
        <div class="post-content">${this.esc(post.content)}</div>
        ${post.image ? `<img class="post-image" src="${post.image}" alt="Post image">` : ''}
        <div class="post-actions">
          <button class="post-action-btn${post.is_liked ? ' liked' : ''}" id="like-btn-${post.id}" title="Like">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${post.is_liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span id="like-count-${post.id}">${post.like_count}</span>
          </button>
          <button class="post-action-btn" onclick="window.location.hash='#/post/${post.id}'" title="Comments">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>${post.comment_count}</span>
          </button>
          ${isOwn ? `
            <button class="post-action-btn post-delete-btn" id="delete-btn-${post.id}" title="Delete Post">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          ` : ''}
        </div>
      </div>
    `;
    },

    bindPostActions(postId) {
        // Like button
        const likeBtn = document.getElementById(`like-btn-${postId}`);
        if (likeBtn) {
            likeBtn.addEventListener('click', async () => {
                const isLiked = likeBtn.classList.contains('liked');
                try {
                    let data;
                    if (isLiked) {
                        data = await App.del(`/api/posts/${postId}/like`);
                        likeBtn.classList.remove('liked');
                        likeBtn.querySelector('svg').setAttribute('fill', 'none');
                    } else {
                        data = await App.post(`/api/posts/${postId}/like`);
                        likeBtn.classList.add('liked');
                        likeBtn.querySelector('svg').setAttribute('fill', 'currentColor');
                    }
                    document.getElementById(`like-count-${postId}`).textContent = data.like_count;
                } catch (err) {
                    App.toast(err.message, 'error');
                }
            });
        }

        // Delete button
        const deleteBtn = document.getElementById(`delete-btn-${postId}`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (!confirm('Delete this post?')) return;
                try {
                    await App.del(`/api/posts/${postId}`);
                    document.getElementById(`post-${postId}`).remove();
                    App.toast('Post deleted');
                } catch (err) {
                    App.toast(err.message, 'error');
                }
            });
        }
    },

    // ─────────────────────────────────────
    //  PROFILE
    // ─────────────────────────────────────
    async renderProfile(container, userId) {
        const [profileData, postsData] = await Promise.all([
            App.get(`/api/users/${userId}`),
            App.get(`/api/posts/user/${userId}`)
        ]);

        const user = profileData.user;
        const posts = postsData.posts;
        const isOwn = App.currentUser && App.currentUser.id === user.id;

        container.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar">
          ${App.getAvatarHTML(user, 'avatar-xl')}
        </div>
        <h1 class="profile-name">${this.esc(user.display_name || user.username)}</h1>
        <p class="profile-username">@${this.esc(user.username)}</p>
        ${user.bio ? `<p class="profile-bio">${this.esc(user.bio)}</p>` : ''}
        <div class="profile-stats">
          <div class="profile-stat">
            <span class="stat-value">${user.post_count}</span>
            <span class="stat-label">Posts</span>
          </div>
          <div class="profile-stat" onclick="window.location.hash='#/followers/${user.id}'" style="cursor:pointer">
            <span class="stat-value">${user.follower_count}</span>
            <span class="stat-label">Followers</span>
          </div>
          <div class="profile-stat" onclick="window.location.hash='#/following/${user.id}'" style="cursor:pointer">
            <span class="stat-value">${user.following_count}</span>
            <span class="stat-label">Following</span>
          </div>
        </div>
        <div class="profile-actions">
          ${isOwn
                ? `<button class="btn btn-outline btn-sm" id="btn-edit-profile">Edit Profile</button>`
                : `<button class="btn ${user.is_following ? 'btn-unfollow' : 'btn-follow'}" id="btn-follow" data-following="${user.is_following}">${user.is_following ? 'Following' : 'Follow'}</button>`
            }
        </div>
      </div>
      <div id="posts-container">
        ${posts.length === 0
                ? `<div class="empty-state">
              <div class="empty-state-icon">📷</div>
              <h3>No posts yet</h3>
              <p>${isOwn ? 'Share your first post!' : 'This user hasn\'t posted yet.'}</p>
            </div>`
                : posts.map(p => this.postCard(p)).join('')
            }
      </div>
    `;

        // Bind follow
        if (!isOwn) {
            const followBtn = document.getElementById('btn-follow');
            followBtn.addEventListener('click', async () => {
                try {
                    const isFollowing = followBtn.dataset.following === 'true';
                    if (isFollowing) {
                        await App.del(`/api/users/${user.id}/follow`);
                        followBtn.className = 'btn btn-follow';
                        followBtn.textContent = 'Follow';
                        followBtn.dataset.following = 'false';
                        App.toast(`Unfollowed @${user.username}`);
                    } else {
                        await App.post(`/api/users/${user.id}/follow`);
                        followBtn.className = 'btn btn-unfollow';
                        followBtn.textContent = 'Following';
                        followBtn.dataset.following = 'true';
                        App.toast(`Following @${user.username}`);
                    }
                } catch (err) {
                    App.toast(err.message, 'error');
                }
            });
        }

        // Bind edit profile
        if (isOwn) {
            document.getElementById('btn-edit-profile').addEventListener('click', () => {
                this.showEditProfileModal(user);
            });
        }

        // Bind post actions
        posts.forEach(p => this.bindPostActions(p.id));
    },

    showEditProfileModal(user) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'edit-profile-modal';
        overlay.innerHTML = `
      <div class="modal-card">
        <h2>Edit Profile</h2>
        <form id="edit-profile-form">
          <div class="form-group">
            <label>Display Name</label>
            <input type="text" class="form-input" id="edit-display-name" value="${this.esc(user.display_name || '')}" placeholder="Your display name">
          </div>
          <div class="form-group">
            <label>Bio</label>
            <textarea class="form-input" id="edit-bio" placeholder="Tell the world about yourself" rows="3" style="resize:vertical;min-height:80px">${this.esc(user.bio || '')}</textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline btn-sm" id="cancel-edit">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Save Changes</button>
          </div>
        </form>
      </div>
    `;
        document.body.appendChild(overlay);

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        document.getElementById('cancel-edit').addEventListener('click', () => overlay.remove());

        document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const display_name = document.getElementById('edit-display-name').value.trim();
            const bio = document.getElementById('edit-bio').value.trim();

            try {
                const data = await App.put(`/api/users/${user.id}`, { display_name, bio });
                App.currentUser = { ...App.currentUser, display_name: data.user.display_name, bio: data.user.bio };
                overlay.remove();
                App.toast('Profile updated!');
                // Refresh profile
                const app = document.getElementById('app');
                await this.renderProfile(app, user.id);
            } catch (err) {
                App.toast(err.message, 'error');
            }
        });
    },

    // ─────────────────────────────────────
    //  POST DETAIL
    // ─────────────────────────────────────
    async renderPost(container, postId) {
        const data = await App.get(`/api/posts/${postId}`);
        const post = data.post;
        const comments = data.comments;

        container.innerHTML = `
      <div style="margin-bottom: 16px;">
        <button class="back-btn" onclick="history.back()" title="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>
      ${this.postCard(post)}
      <div class="post-card">
        <div class="comments-section">
          <h3>Comments (${comments.length})</h3>
          <div id="comments-list">
            ${comments.map(c => this.commentItem(c)).join('')}
          </div>
          <form class="comment-form" id="comment-form">
            <input type="text" id="comment-input" placeholder="Write a comment..." maxlength="500">
            <button type="submit" class="btn btn-primary btn-sm">Post</button>
          </form>
        </div>
      </div>
    `;

        // Bind post actions
        this.bindPostActions(post.id);

        // Bind comment delete
        comments.forEach(c => this.bindCommentDelete(c.id));

        // Bind comment form
        document.getElementById('comment-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('comment-input');
            const content = input.value.trim();
            if (!content) return;

            try {
                const data = await App.post(`/api/posts/${postId}/comments`, { content });
                input.value = '';
                document.getElementById('comments-list').insertAdjacentHTML('beforeend', this.commentItem(data.comment));
                this.bindCommentDelete(data.comment.id);
                App.toast('Comment added!');
            } catch (err) {
                App.toast(err.message, 'error');
            }
        });
    },

    commentItem(comment) {
        const isOwn = App.currentUser && App.currentUser.id === comment.user_id;
        return `
      <div class="comment-item" id="comment-${comment.id}">
        ${App.getAvatarHTML(comment, 'avatar-sm')}
        <div class="comment-body">
          <div class="comment-meta">
            <span class="display-name" onclick="window.location.hash='#/profile/${comment.user_id}'">${this.esc(comment.display_name || comment.username)}</span>
            <span class="comment-time">${App.timeAgo(comment.created_at)}</span>
            ${isOwn ? `<button class="comment-delete" id="del-comment-${comment.id}" title="Delete">✕</button>` : ''}
          </div>
          <p class="comment-content">${this.esc(comment.content)}</p>
        </div>
      </div>
    `;
    },

    bindCommentDelete(commentId) {
        const btn = document.getElementById(`del-comment-${commentId}`);
        if (btn) {
            btn.addEventListener('click', async () => {
                try {
                    await App.del(`/api/comments/${commentId}`);
                    document.getElementById(`comment-${commentId}`).remove();
                    App.toast('Comment deleted');
                } catch (err) {
                    App.toast(err.message, 'error');
                }
            });
        }
    },

    // ─────────────────────────────────────
    //  EXPLORE
    // ─────────────────────────────────────
    async renderExplore(container) {
        const data = await App.get('/api/users');
        const users = data.users;

        container.innerHTML = `
      <div class="explore-header">
        <h1>Discover People</h1>
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="search-input" placeholder="Search by username or name...">
        </div>
      </div>
      <div class="user-list" id="user-list">
        ${users.length === 0
                ? `<div class="empty-state"><div class="empty-state-icon">👥</div><h3>No users found</h3><p>Be the first one here!</p></div>`
                : users.map(u => this.userCard(u)).join('')
            }
      </div>
    `;

        // Bind search
        let searchTimeout;
        document.getElementById('search-input').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                const query = e.target.value.trim();
                const url = query ? `/api/users?search=${encodeURIComponent(query)}` : '/api/users';
                try {
                    const data = await App.get(url);
                    const listEl = document.getElementById('user-list');
                    if (data.users.length === 0) {
                        listEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>No results</h3><p>Try a different search term</p></div>`;
                    } else {
                        listEl.innerHTML = data.users.map(u => this.userCard(u)).join('');
                        data.users.forEach(u => this.bindFollowBtn(u.id));
                    }
                } catch (err) {
                    App.toast(err.message, 'error');
                }
            }, 300);
        });

        // Bind follow buttons
        users.forEach(u => this.bindFollowBtn(u.id));
    },

    userCard(user) {
        return `
      <div class="user-card" id="user-card-${user.id}">
        <div onclick="window.location.hash='#/profile/${user.id}'" style="display:flex;align-items:center;gap:14px;flex:1;min-width:0;">
          ${App.getAvatarHTML(user)}
          <div class="user-card-info">
            <div class="display-name">${this.esc(user.display_name || user.username)}</div>
            <div class="username">@${this.esc(user.username)}</div>
            ${user.bio ? `<div class="bio-preview">${this.esc(user.bio)}</div>` : ''}
          </div>
        </div>
        <button class="btn ${user.is_following ? 'btn-unfollow' : 'btn-follow'}" 
                id="follow-btn-${user.id}" 
                data-following="${user.is_following}"
                onclick="event.stopPropagation()">
          ${user.is_following ? 'Following' : 'Follow'}
        </button>
      </div>
    `;
    },

    bindFollowBtn(userId) {
        const btn = document.getElementById(`follow-btn-${userId}`);
        if (!btn) return;
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const isFollowing = btn.dataset.following === 'true';
            try {
                if (isFollowing) {
                    await App.del(`/api/users/${userId}/follow`);
                    btn.className = 'btn btn-follow';
                    btn.textContent = 'Follow';
                    btn.dataset.following = 'false';
                } else {
                    await App.post(`/api/users/${userId}/follow`);
                    btn.className = 'btn btn-unfollow';
                    btn.textContent = 'Following';
                    btn.dataset.following = 'true';
                }
            } catch (err) {
                App.toast(err.message, 'error');
            }
        });
    },

    // ─────────────────────────────────────
    //  FOLLOWERS / FOLLOWING LIST
    // ─────────────────────────────────────
    async renderFollowList(container, userId, type) {
        const data = await App.get(`/api/users/${userId}/${type}`);
        const users = data.users;
        const profileData = await App.get(`/api/users/${userId}`);
        const profileUser = profileData.user;

        const title = type === 'followers' ? 'Followers' : 'Following';

        container.innerHTML = `
      <div class="follow-list-header">
        <button class="back-btn" onclick="window.location.hash='#/profile/${userId}'" title="Back to profile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2>${this.esc(profileUser.display_name || profileUser.username)}'s ${title}</h2>
      </div>
      <div class="user-list">
        ${users.length === 0
                ? `<div class="empty-state"><div class="empty-state-icon">👤</div><h3>No ${type}</h3><p>${type === 'followers' ? 'No one is following this user yet.' : 'This user isn\'t following anyone yet.'}</p></div>`
                : users.map(u => this.userCard(u)).join('')
            }
      </div>
    `;

        users.forEach(u => this.bindFollowBtn(u.id));
    },

    // ─── HTML Escape ───
    esc(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
