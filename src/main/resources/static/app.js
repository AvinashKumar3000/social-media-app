let currentUser = null;
let followingSet = new Set();
const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    const rawUser = localStorage.getItem('currentUser');
    if (rawUser) {
        try {
            currentUser = JSON.parse(rawUser);
            setupDashboardMode();
        } catch (e) {
            console.error('Error parsing stored user:', e);
            localStorage.removeItem('currentUser');
            setupLandingMode();
        }
    } else {
        setupLandingMode();
    }
}

function setupLandingMode() {
    // Show landing sections
    const landingElements = document.querySelectorAll('header.hero, .strip, #features, #quote, .quote-section, .cta-final, footer');
    landingElements.forEach(el => el.classList.remove('hidden'));
    
    // Hide dashboard
    document.getElementById('appDashboard').classList.add('hidden');
    
    // navbar
    document.getElementById('navAuthCta').classList.remove('hidden');
    document.getElementById('navDashboardCta').classList.add('hidden');
    
    // Wire actions to login page
    const ctaButtons = document.querySelectorAll('nav .navcta a, .hero-actions a[href="#join"], .cta-final a[href="#join"], a[href="#join"]');
    ctaButtons.forEach(btn => {
        btn.setAttribute('href', '/login.html');
        if (btn.innerText.includes('Get started') || btn.innerText.includes('Join Pulse') || btn.innerText.includes('Room')) {
            btn.onclick = () => {
                sessionStorage.setItem('preferred_auth_mode', 'register');
            };
        } else {
            btn.onclick = () => {
                sessionStorage.setItem('preferred_auth_mode', 'login');
            };
        }
    });
}

async function setupDashboardMode() {
    // Hide landing elements
    const landingElements = document.querySelectorAll('header.hero, .strip, #features, #quote, .quote-section, .cta-final, footer');
    landingElements.forEach(el => el.classList.add('hidden'));
    
    // Show dashboard
    document.getElementById('appDashboard').classList.remove('hidden');
    
    // Navbar
    document.getElementById('navAuthCta').classList.add('hidden');
    document.getElementById('navDashboardCta').classList.remove('hidden');
    
    // Update profile
    updateLocalProfileUI();

    // Sync connection cache
    await updateFollowsCache();
    
    // Show profile counts
    fetchProfileStats();
    
    // Default tab
    switchTab('feed');
}

function updateLocalProfileUI() {
    document.getElementById('navUsername').innerText = currentUser.name;
    document.getElementById('profileName').innerText = currentUser.name;
    document.getElementById('profileEmail').innerText = currentUser.email;
    document.getElementById('profileBio').innerText = currentUser.bio || "No bio written yet. Share a piece of your world.";
    
    const isPriv = currentUser.isPrivate !== false;
    document.getElementById('profilePrivacyBadge').innerText = isPriv ? "Circle Close" : "Public";
    
    const initials = currentUser.name.trim().charAt(0).toUpperCase();
    const navAv = document.getElementById('navAvatar');
    const profAv = document.getElementById('profileAvatar');
    const inpAv = document.getElementById('inputAvatar');
    
    navAv.innerText = initials;
    profAv.innerText = initials;
    if (inpAv) inpAv.innerText = initials;
    
    const avClass = getAvatarColorClass(currentUser.name);
    navAv.className = `avatar ${avClass}`;
    profAv.className = `avatar-large ${avClass}`;
    if (inpAv) inpAv.className = `avatar ${avClass}`;
    
    if (currentUser.profilePic) {
        navAv.style.backgroundImage = `url(${currentUser.profilePic})`;
        navAv.style.backgroundSize = 'cover';
        navAv.style.backgroundPosition = 'center';
        navAv.innerText = '';
        
        profAv.style.backgroundImage = `url(${currentUser.profilePic})`;
        profAv.style.backgroundSize = 'cover';
        profAv.style.backgroundPosition = 'center';
        profAv.innerText = '';

        if (inpAv) {
            inpAv.style.backgroundImage = `url(${currentUser.profilePic})`;
            inpAv.style.backgroundSize = 'cover';
            inpAv.style.backgroundPosition = 'center';
            inpAv.innerText = '';
        }
    } else {
        navAv.style.backgroundImage = '';
        profAv.style.backgroundImage = '';
        if (inpAv) inpAv.style.backgroundImage = '';
    }
}

async function fetchProfileStats() {
    if (!currentUser) return;
    try {
        const followersRes = await fetch(`${API_BASE}/follows/followers/${currentUser.id}`);
        const followers = await followersRes.json();
        if (followers.success) {
            document.getElementById('profileFollowersCount').innerText = followers.data.length;
        }

        const followingRes = await fetch(`${API_BASE}/follows/following/${currentUser.id}`);
        const following = await followingRes.json();
        if (following.success) {
            document.getElementById('profileFollowingCount').innerText = following.data.length;
            renderQuickFollowingList(following.data);
        }
    } catch (e) {
        console.error("Error fetching stats:", e);
    }
}

function renderQuickFollowingList(followingList) {
    const listEl = document.getElementById('quickFollowingList');
    if (!listEl) return;
    listEl.innerHTML = '';
    
    if (!followingList || followingList.length === 0) {
        listEl.innerHTML = `<span style="font-size:12px; color:var(--ink-dim);">No active rooms. Follow users in Explore to grow your circle.</span>`;
        return;
    }
    
    followingList.slice(0, 5).forEach(u => {
        const initials = u.name.charAt(0).toUpperCase();
        const avClass = getAvatarColorClass(u.name);
        
        const item = document.createElement('div');
        item.className = 'quick-user-item';
        
        let avStyle = '';
        let avText = initials;
        if (u.profilePic) {
            avStyle = `background-image: url(${u.profilePic}); background-size: cover; background-position: center;`;
            avText = '';
        }
        
        item.innerHTML = `
            <div class="${avClass}" style="width:20px; height:20px; font-size:9px; display:flex; align-items:center; justify-content:center; ${avStyle}">${avText}</div>
            <span class="quick-user-name">${u.name}</span>
        `;
        listEl.appendChild(item);
    });
}

async function updateFollowsCache() {
    if (!currentUser) return;
    try {
        const followingRes = await fetch(`${API_BASE}/follows/following/${currentUser.id}`);
        const result = await followingRes.json();
        if (result.success) {
            followingSet = new Set(result.data.map(u => u.id));
        }
    } catch (e) {
        console.error("Error updating connection cache:", e);
    }
}

async function loadFeed() {
    const feedContainer = document.getElementById('feedPostsList');
    feedContainer.innerHTML = `<div class="text-center" style="padding: 40px; color: var(--ink-dim);">Tuning in to your circles...</div>`;
    
    const banner = document.getElementById('communityFeedBanner');
    banner.classList.add('hidden');

    try {
        const res = await fetch(`${API_BASE}/posts/feed/${currentUser.id}`);
        const result = await res.json();
        
        let posts = [];
        if (result.success && result.data && result.data.length > 0) {
            posts = result.data;
        } else {
            banner.classList.remove('hidden');
            const globalRes = await fetch(`${API_BASE}/posts`);
            const globalResult = await globalRes.json();
            if (globalResult.success && globalResult.data) {
                posts = globalResult.data;
            }
        }
        
        renderPosts(posts, feedContainer);
    } catch (e) {
        console.error(e);
        feedContainer.innerHTML = `<div class="text-center" style="padding: 40px; color: var(--coral);">Failed to load posts. Is the service listening?</div>`;
    }
}

function renderPosts(posts, container) {
    container.innerHTML = '';
    
    if (!posts || posts.length === 0) {
        container.innerHTML = `<div class="text-center" style="padding: 40px; color: var(--ink-dim); border: 1px dashed var(--line); border-radius:18px;">
            <h3>The room is quiet.</h3>
            <p style="font-size:13.5px; margin-top:8px;">No one has cast an echo yet. Start the conversation!</p>
        </div>`;
        return;
    }
    
    const sortedPosts = [...posts].sort((a, b) => b.id - a.id);
    
    sortedPosts.forEach(post => {
        const author = post.user;
        const initials = author.name.charAt(0).toUpperCase();
        const avClass = getAvatarColorClass(author.name);
        
        let avStyle = '';
        let avText = initials;
        if (author.profilePic) {
            avStyle = `background-image: url(${author.profilePic}); background-size: cover; background-position: center;`;
            avText = '';
        }
        
        const canDelete = currentUser && author.id === currentUser.id;
        const deleteButton = canDelete ? 
            `<button class="delete-btn" onclick="handleDeletePost(${post.id}, this.closest('.post-card'))" title="Delete Echo">✕</button>` : '';
            
        const rawLikes = localStorage.getItem(`post_liked_${currentUser.id}_${post.id}`);
        const hasLiked = rawLikes === 'true';
        
        let formattedDate = 'just now';
        if (post.createdAt) {
            const date = new Date(post.createdAt);
            if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }
        
        const card = document.createElement('div');
        card.className = 'post-card';
        card.innerHTML = `
            <div class="post-card-header">
                <div class="post-author-info">
                    <div class="${avClass}" style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; ${avStyle}">${avText}</div>
                    <div>
                        <div class="post-author-name">${author.name}</div>
                        <div class="post-time">${formattedDate}</div>
                    </div>
                </div>
                ${deleteButton}
            </div>
            <div class="post-card-body">
                <p class="post-desc">${escapeHtml(post.description || '')}</p>
                ${post.imageUrl ? `
                    <div class="post-image-container">
                        <img src="${post.imageUrl}" class="post-img" alt="Post Echo" onerror="this.parentElement.remove()">
                    </div>
                ` : ''}
            </div>
            <div class="post-card-actions">
                <button class="like-btn ${hasLiked ? 'liked' : ''}" onclick="handleLikeToggle(${post.id}, ${post.user.id}, this)">
                    <span class="like-icon">♥</span>
                    <span class="like-count-lbl"><span class="count">${post.count || 0}</span> likes</span>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function handleLikeToggle(postId, postAuthorId, buttonEl) {
    if (!currentUser) return;
    
    const countEl = buttonEl.querySelector('.count');
    let currentCount = parseInt(countEl.innerText) || 0;
    
    const likeKey = `post_liked_${currentUser.id}_${postId}`;
    const hasLiked = localStorage.getItem(likeKey) === 'true';
    
    let newCount = hasLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
    
    try {
        const postRes = await fetch(`${API_BASE}/posts/${postId}`);
        const postResult = await postRes.json();
        
        if (postResult.success) {
            const postData = postResult.data;
            
            const updateRes = await fetch(`${API_BASE}/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageUrl: postData.imageUrl,
                    description: postData.description,
                    userId: postAuthorId,
                    count: newCount
                })
            });
            const updateResult = await updateRes.json();
            
            if (updateResult.success) {
                if (hasLiked) {
                    localStorage.removeItem(likeKey);
                    buttonEl.classList.remove('liked');
                } else {
                    localStorage.setItem(likeKey, 'true');
                    buttonEl.classList.add('liked');
                }
                countEl.innerText = newCount;
            }
        }
    } catch (e) {
        console.error("Error liking post:", e);
    }
}

async function loadExplore() {
    const exploreContainer = document.getElementById('exploreUsersList');
    exploreContainer.innerHTML = `<div class="text-center" style="grid-column: 1/-1; padding: 40px; color: var(--ink-dim);">Searching rooms...</div>`;
    
    try {
        await updateFollowsCache();
        
        const res = await fetch(`${API_BASE}/users`);
        const result = await res.json();
        
        if (result.success && result.data) {
            const otherUsers = result.data.filter(u => u.id !== currentUser.id);
            
            exploreContainer.innerHTML = '';
            
            if (otherUsers.length === 0) {
                exploreContainer.innerHTML = `<div class="text-center" style="grid-column: 1/-1; padding: 40px; color: var(--ink-dim);">
                    <p>No other rooms found in this space.</p>
                </div>`;
                return;
            }
            
            otherUsers.forEach(u => {
                const initials = u.name.charAt(0).toUpperCase();
                const avClass = getAvatarColorClass(u.name);
                const isFollowing = followingSet.has(u.id);
                
                let avStyle = '';
                let avText = initials;
                if (u.profilePic) {
                    avStyle = `background-image: url(${u.profilePic}); background-size: cover; background-position: center;`;
                    avText = '';
                }
                
                const card = document.createElement('div');
                card.className = 'user-explore-card';
                card.innerHTML = `
                    <div class="${avClass}">${avText}</div>
                    <h4>${u.name}</h4>
                    <span class="private-lbl">${u.isPrivate !== false ? '🔒 Close Circle' : '🌍 Open Room'}</span>
                    <p class="bio">${escapeHtml(u.bio || 'Listening to the echoes...')}</p>
                    <button class="btn ${isFollowing ? 'btn-ghost' : 'btn-solid'}" 
                        onclick="toggleFollowUser(${u.id}, this)">
                        ${isFollowing ? 'Leave Room' : 'Join Room'}
                    </button>
                `;
                if (u.profilePic) {
                    const avNode = card.querySelector('.avatar');
                    avNode.style.backgroundImage = `url(${u.profilePic})`;
                    avNode.style.backgroundSize = 'cover';
                    avNode.style.backgroundPosition = 'center';
                }
                exploreContainer.appendChild(card);
            });
        }
    } catch (e) {
        console.error(e);
        exploreContainer.innerHTML = `<div class="text-center" style="grid-column: 1/-1; padding: 40px; color: var(--coral);">Failed to explore rooms.</div>`;
    }
}

async function toggleFollowUser(targetUserId, buttonEl) {
    if (!currentUser) return;
    
    buttonEl.disabled = true;
    const isFollowing = followingSet.has(targetUserId);
    const action = isFollowing ? 'unfollow' : 'follow';
    
    try {
        const response = await fetch(`${API_BASE}/follows/${action}?followerId=${currentUser.id}&followingId=${targetUserId}`, {
            method: 'POST'
        });
        const result = await response.json();
        
        if (result.success) {
            if (isFollowing) {
                followingSet.delete(targetUserId);
                buttonEl.innerText = 'Join Room';
                buttonEl.className = 'btn btn-solid';
                showToast('Left user\'s room', 'success');
            } else {
                followingSet.add(targetUserId);
                buttonEl.innerText = 'Leave Room';
                buttonEl.className = 'btn btn-ghost';
                showToast('Joined user\'s room!', 'success');
            }
            fetchProfileStats();
        } else {
            showToast(result.message || 'Action failed.', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Server communications error.', 'error');
    } finally {
        buttonEl.disabled = false;
    }
}

async function loadMyEchoes() {
    const listEl = document.getElementById('myPostsList');
    listEl.innerHTML = `<div class="text-center" style="padding: 40px; color: var(--ink-dim);">Gathering your pulses...</div>`;
    
    try {
        const res = await fetch(`${API_BASE}/posts/user/${currentUser.id}`);
        const result = await res.json();
        
        if (result.success) {
            renderPosts(result.data, listEl);
        }
    } catch (e) {
        console.error(e);
        listEl.innerHTML = `<div class="text-center" style="padding: 40px; color: var(--coral);">Failed to load echoes.</div>`;
    }
}

async function handleDeletePost(postId, cardElement) {
    if (!confirm('Are you sure you want to delete this echo?')) return;
    
    try {
        const res = await fetch(`${API_BASE}/posts/${postId}`, {
            method: 'DELETE'
        });
        const result = await res.json();
        
        if (result.success) {
            cardElement.style.transition = 'all 0.3s ease';
            cardElement.style.opacity = '0';
            cardElement.style.transform = 'translateY(10px)';
            setTimeout(() => {
                cardElement.remove();
                showToast('Echo deleted successfully.', 'success');
                fetchProfileStats();
            }, 300);
        } else {
            showToast(result.message || 'Deletion failed.', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Communication error with server.', 'error');
    }
}

async function handleUpdateProfile(event) {
    event.preventDefault();
    
    const name = document.getElementById('editName').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    const profilePic = document.getElementById('editProfilePic').value.trim();
    const isPrivate = document.getElementById('editPrivacy').value === 'true';
    
    try {
        const response = await fetch(`${API_BASE}/users/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email: currentUser.email,
                bio,
                profilePic,
                isPrivate
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Profile updated!', 'success');
            currentUser = result.data;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateLocalProfileUI();
            closeEditProfileModal();
        } else {
            showToast(result.message || 'Failed to update profile.', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Server communications error.', 'error');
    }
}

async function handleCreatePost(event) {
    event.preventDefault();
    
    const description = document.getElementById('postDescription').value.trim();
    let imageUrl = document.getElementById('postImageUrl').value.trim();
    
    if (!description && !imageUrl) {
        showToast('Please type a description or add an imageUrl', 'error');
        return;
    }
    
    if (!imageUrl) {
        const randomBackdrops = [
            'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1472214222541-d510753a4707?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&auto=format&fit=crop'
        ];
        imageUrl = randomBackdrops[Math.floor(Math.random() * randomBackdrops.length)];
    }
    
    try {
        const res = await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageUrl,
                description,
                count: 0,
                userId: currentUser.id
            })
        });
        
        const result = await res.json();
        
        if (result.success) {
            showToast('Echo posted!', 'success');
            closeCreatePostModal();
            
            document.getElementById('postDescription').value = '';
            document.getElementById('postImageUrl').value = '';
            
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab.innerHTML.includes('Circle')) {
                loadFeed();
            } else if (activeTab.innerHTML.includes('Echoes')) {
                loadMyEchoes();
            }
        } else {
            showToast(result.message || 'Failed to post echo.', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Server communications error.', 'error');
    }
}

async function showFollowersModal() {
    openUserListModal('Followers');
    const contentEl = document.getElementById('userListModalContent');
    contentEl.innerHTML = '<div style="color:var(--ink-dim); text-align:center; padding: 20px;">Tuning followers list...</div>';
    
    try {
        const res = await fetch(`${API_BASE}/follows/followers/${currentUser.id}`);
        const result = await res.json();
        
        if (result.success) {
            renderUserListModalItems(result.data);
        } else {
            contentEl.innerHTML = '<div style="color:var(--coral); text-align:center; padding: 20px;">Failed to load.</div>';
        }
    } catch (e) {
        console.error(e);
        contentEl.innerHTML = '<div style="color:var(--coral); text-align:center; padding: 20px;">Failed to load.</div>';
    }
}

async function showFollowingModal() {
    openUserListModal('Following');
    const contentEl = document.getElementById('userListModalContent');
    contentEl.innerHTML = '<div style="color:var(--ink-dim); text-align:center; padding: 20px;">Tuning following list...</div>';
    
    try {
        const res = await fetch(`${API_BASE}/follows/following/${currentUser.id}`);
        const result = await res.json();
        
        if (result.success) {
            renderUserListModalItems(result.data);
        } else {
            contentEl.innerHTML = '<div style="color:var(--coral); text-align:center; padding: 20px;">Failed to load.</div>';
        }
    } catch (e) {
        console.error(e);
        contentEl.innerHTML = '<div style="color:var(--coral); text-align:center; padding: 20px;">Failed to load.</div>';
    }
}

function renderUserListModalItems(users) {
    const contentEl = document.getElementById('userListModalContent');
    contentEl.innerHTML = '';
    
    if (!users || users.length === 0) {
        contentEl.innerHTML = '<div style="color:var(--ink-dim); text-align:center; padding: 20px;">No rooms linked in this list.</div>';
        return;
    }
    
    users.forEach(u => {
        const initials = u.name.charAt(0).toUpperCase();
        const avClass = getAvatarColorClass(u.name);
        
        let avStyle = '';
        let avText = initials;
        if (u.profilePic) {
            avStyle = `background-image: url(${u.profilePic}); background-size: cover; background-position: center;`;
            avText = '';
        }
        
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '12px';
        row.style.padding = '8px 4px';
        row.style.borderBottom = '1px solid var(--line)';
        
        row.innerHTML = `
            <div class="${avClass}" style="width:28px; height:28px; font-size:11px; display:flex; align-items:center; justify-content:center; ${avStyle}">${avText}</div>
            <div style="flex:1;">
                <div style="font-size:14px; font-weight:600;">${u.name}</div>
                <div style="font-size:11px; color:var(--ink-dim);">${u.isPrivate !== false ? '🔒 Close' : '🌍 Public'}</div>
            </div>
        `;
        contentEl.appendChild(row);
    });
}

function openCreatePostModal() {
    document.getElementById('createPostModal').classList.add('active');
}
function closeCreatePostModal() {
    document.getElementById('createPostModal').classList.remove('active');
}

function openEditProfileModal() {
    document.getElementById('editName').value = currentUser.name;
    document.getElementById('editBio').value = currentUser.bio || '';
    document.getElementById('editProfilePic').value = currentUser.profilePic || '';
    document.getElementById('editPrivacy').value = currentUser.isPrivate ? 'true' : 'false';
    document.getElementById('editProfileModal').classList.add('active');
}
function closeEditProfileModal() {
    document.getElementById('editProfileModal').classList.remove('active');
}

function openUserListModal(title) {
    document.getElementById('userListModalTitle').innerText = title;
    document.getElementById('userListModal').classList.add('active');
}
function closeUserListModal() {
    document.getElementById('userListModal').classList.remove('active');
}

function switchTab(tabName) {
    document.getElementById('tabContentFeed').classList.add('hidden');
    document.getElementById('tabContentExplore').classList.add('hidden');
    document.getElementById('tabContentEchoes').classList.add('hidden');
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if (tabName === 'feed') {
        document.getElementById('tabContentFeed').classList.remove('hidden');
        const btn = document.querySelector('.tab-btn[onclick="switchTab(\'feed\')"]');
        if (btn) btn.classList.add('active');
        loadFeed();
    } else if (tabName === 'explore') {
        document.getElementById('tabContentExplore').classList.remove('hidden');
        const btn = document.querySelector('.tab-btn[onclick="switchTab(\'explore\')"]');
        if (btn) btn.classList.add('active');
        loadExplore();
    } else if (tabName === 'echoes') {
        document.getElementById('tabContentEchoes').classList.remove('hidden');
        const btn = document.querySelector('.tab-btn[onclick="switchTab(\'echoes\')"]');
        if (btn) btn.classList.add('active');
        loadMyEchoes();
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
}

function getAvatarColorClass(name) {
    const char = (name || 'A').toUpperCase().charCodeAt(0);
    const val = char % 3;
    if (val === 0) return 'avatar a1';
    if (val === 1) return 'avatar a2';
    return 'avatar a3';
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-message">${message}</div>
        <div class="toast-close" onclick="this.parentElement.remove()">✕</div>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
