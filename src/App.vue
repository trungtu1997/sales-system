<template>
  <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>

  <LoginForm v-if="!user" @logged-in="handleLogin" />

  <div v-else class="app-container">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <i class='bx bx-menu-alt-left'></i>
      </div>
      
      <nav class="nav-menu">
        <ul>
          <li :class="{ active: $route.path === '/' }" @click="$router.push('/')" data-tooltip="Dashboard">
            <i class='bx bx-bar-chart-alt-2'></i>
          </li>
          <li :class="{ active: $route.path === '/brands' }" @click="$router.push('/brands')" data-tooltip="Brands">
            <i class='bx bx-tag-alt'></i>
          </li>
          <li :class="{ active: $route.path === '/categories' }" @click="$router.push('/categories')" data-tooltip="Categories">
            <i class='bx bx-book'></i>
          </li>
          <li :class="{ active: $route.path === '/products' }" @click="$router.push('/products')" data-tooltip="Products">
            <i class='bx bx-shopping-bag'></i>
          </li>
          <li data-tooltip="Messages">
            <i class='bx bx-envelope'></i>
          </li>
          <li data-tooltip="Settings">
            <i class='bx bx-cog'></i>
          </li>
        </ul>
      </nav>
    </aside>

    <div class="main-area">
      <header class="top-header">
        <div class="header-right">
          <div class="icon-group">
            <div class="notification">
              <i class='bx bx-bell'></i>
              <span class="dot"></span>
            </div>
          </div>
          <div class="user-details">
              <span class="user-role">{{ role === 'admin' ? 'Administrator' : 'Nhân viên' }}</span>
          </div>
          <div class="header-controls">
              <div class="user-avatar" @click="toggleDropdown">
              <img :src="`https://ui-avatars.com/api/?name=${user.email}&background=random`" alt="avatar">

              <transition name="fade">
                <div v-if="isDropdownOpen" class="dropdown-menu">
                  <div class="dropdown-item">
                    <i class="fas fa-user-circle"></i> Thông tin user
                  </div>
                  <div class="dropdown-item">
                    <i class="fas fa-key"></i> Đổi mật khẩu
                  </div>
                  <div class="dropdown-divider"></div>
                  <div class="dropdown-item logout" @click="logout()">
                    <i class="fas fa-sign-out-alt"></i> Đăng xuất
                  </div>
                </div>
              </transition>
          </div>
          </div>
        </div>
      </header>
      <main class="content-wrapper">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import LoginForm from './components/LoginForm.vue'
import { supabase } from './supabaseClient'

export default {
  components: { LoginForm },
  data() {
    return {
      user: null,
      role: 'staff',
      isDropdownOpen: false, 
    }
  },
  computed: {
    getPageTitle() {
      if (this.$route.path === '/') return 'Dashboard Overview';
      if (this.$route.path === '/products') return 'Quản Lý Sản Phẩm';
      if (this.$route.path === '/categories') return 'Quản Lý Danh Mục';
      if (this.$route.path === '/brands') return 'Quản Lý Thương Hiệu';
      return 'Trang Quản Trị';
    }
  },
  watch: {
    user: {
      immediate: true,
      handler(newUser) {
        if (newUser) {
          document.body.classList.add('dashboard-mode');
        } else {
          document.body.classList.remove('dashboard-mode');
        }
      }
    }
  },
  methods: {
    toggleDropdown(event) {
      if (event) event.stopPropagation();
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    closeDropdown() {
      this.isDropdownOpen = false;
    },
    handleLogin(user) {
      this.user = user;
      this.loadRole();
    },
    async loadRole() {
      if (!this.user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', this.user.id)
        .maybeSingle();

      this.role = (data && !error) ? data.role : 'staff';
    },
    async logout() {
      const confirmLogout = confirm("Bạn có chắc chắn muốn đăng xuất không?");
      if (!confirmLogout) return;

      try {
        await supabase.auth.signOut();
        this.user = null;
        this.role = 'staff';
        this.isDropdownOpen = false;
        // Sử dụng window.location để đảm bảo app được reset sạch sẽ
        window.location.href = '/'; 
      } catch (err) {
        console.error("Lỗi logout:", err.message);
      }
    }
  },
  mounted() {
    window.addEventListener('click', this.closeDropdown);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        this.user = session.user;
        this.loadRole();
      }
    });
  },
  beforeUnmount() {
    window.removeEventListener('click', this.closeDropdown);
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box; /* Đảm bảo padding không làm tăng chiều rộng phần tử */
}
:root {
  --primary-purple: #6343ff;
  --bg-color: #f4f7fe;
  --text-main: #2b3674;
  --text-gray: #a3aed0;
  --white: #ffffff;
}
/* Dùng biến user để xác định khi nào thì ép tràn màn hình */
:global(body:has(.app-container)) {
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  display: block !important; /* Gỡ căn giữa của Login */
}

:global(#app:has(.app-container)) {
  max-width: none !important;
  width: 100vw !important;
  height: 100vh !important;
  padding: 0 !important;
  margin: 0 !important;
}

.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-color);
  color: var(--text-main);
  overflow: hidden;
}

/* --- SIDEBAR --- */
/* --- TOOLTIP LOGIC (CSS ONLY) --- */
.nav-menu li {
  position: relative; /* Làm gốc cho tooltip */
}

/* Tạo nội dung Tooltip */
.nav-menu li::after {
  content: attr(data-tooltip); /* Lấy nội dung từ attribute data-tooltip */
  position: absolute;
  left: 110%; /* Hiển thị bên phải icon */
  top: 50%;
  transform: translateY(-50%) translateX(10px);
  background: #2a2a2c;
  color: white;
  padding: 6px 12px;
  border-radius: 30px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 1000;
}

/* Mũi tên nhỏ cho Tooltip */
.nav-menu li::before {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: #2b3674;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

/* Hiển thị khi Hover */
.nav-menu li:hover::after,
.nav-menu li:hover::before {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) translateX(0);
}

/* --- CẬP NHẬT RESPONSIVE (Ẩn Tooltip trên Mobile) --- */
@media (max-width: 480px) {
  .nav-menu li::after,
  .nav-menu li::before {
    display: none !important; /* Mobile không dùng tooltip chuột */
  }
}

/* --- GIỮ LẠI CÁC STYLE SIDEBAR & HEADER CŨ --- */
.sidebar {
  width: 80px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 0;
  border-right: 1px solid #f0f0f0;
}

/* Style cho Header gọn gàng */
.top-header {
  display: flex;
  justify-content: space-between;
  padding: 20px 40px;
  align-items: center;
}

.search-wrapper {
  background: white;
  padding: 12px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.search-wrapper input {
  border: none;
  outline: none;
  background: transparent;
  width: 250px;
}
.sidebar {
  width: 80px;
  background: var(--white);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 0;
  z-index: 100;
}

.sidebar-brand {
  font-size: 24px;
  margin-bottom: 40px;
  color: var(--text-main);
}

.nav-menu ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.nav-menu li {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-gray);
  font-size: 19px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.nav-menu li:hover {
  background: #d8d8d8;
  color: var(--primary-purple);
}

.nav-menu li.active {
  background: rgb(0, 0, 0);
  color: rgb(255, 255, 255);
  box-shadow: 0 10px 20px rgba(190, 190, 190, 0.3);
}

/* --- MAIN AREA --- */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f9f9f9;
}

/* --- HEADER --- */
.top-header {
  height: 90px;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-wrapper {
  background: var(--white);
  padding: 10px 20px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 350px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.search-wrapper input {
  border: none;
  outline: none;
  font-size: 14px;
  width: 100%;
  color: var(--text-main);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-left: auto;
}

.icon-group {
  display: flex;
  gap: 20px;
  font-size: 20px;
  color: var(--text-gray);
}

.notification {
  position: relative;
}

.dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 7px;
  height: 7px;
  background: #ff5b5b;
  border: 2px solid var(--bg-color);
  border-radius: 50%;
}

/* --- CONTENT --- */
.content-wrapper {
  flex: 1;
  padding: 0 40px 40px 40px;
  overflow-y: auto;
}

/* --- RESPONSIVE --- */

/* Table (Dưới 1024px) */
@media (max-width: 1024px) {
  .search-wrapper {
    width: 250px;
  }
}

/* Mobile (Dưới 768px) */
@media (max-width: 768px) {
  .sidebar {
    width: 65px;
  }
  .top-header {
    padding: 0 20px;
  }
  .search-wrapper {
    display: none; /* Ẩn search bar trên mobile để tiết kiệm diện tích */
  }
  .content-wrapper {
    padding: 15px;
  }
}

/* Mobile cực nhỏ */
@media (max-width: 480px) {
  .app-container {
    flex-direction: column-reverse; /* Đưa menu xuống dưới như app mobile */
  }
  .sidebar {
    width: 100%;
    height: 60px;
    flex-direction: row;
    padding: 0;
    justify-content: space-around;
  }
  .sidebar-brand { display: none; }
  .nav-menu ul {
    flex-direction: row;
    width: 100%;
    justify-content: space-around;
  }
  .nav-menu li.active::before { display: none; }
  .top-header { height: 70px; }
}
/* Đảm bảo thẻ cha có vị trí tương đối */
.user-avatar {
  position: relative; 
  cursor: pointer;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #000000;
}

/* Dropdown menu phải nổi lên trên cùng */
.dropdown-menu {
  position: absolute;
  top: 110%; /* Hiển thị ngay dưới avatar */
  right: 0;
  width: 180px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 9999 !important; /* Ưu tiên hiển thị cao nhất */
  padding: 8px 0;
  display: flex;
  flex-direction: column;
}

.dropdown-item {
  padding: 10px 16px;
  font-size: 14px;
  color: #2B3674;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #F4F7FE;
}

.dropdown-item.logout {
  color: #E03131;
  border-top: 1px solid #eee;
}

/* Animation mờ dần */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>