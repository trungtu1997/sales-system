<template>
  <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>

  <LoginForm v-if="!user" @logged-in="handleLogin" />

  <div v-else class="app-container">
    <aside class="sidebar">
      <div class="logo-area">
        <div class="logo-icon">A</div> <span class="logo-text">AppManager</span>
      </div>

      <nav class="nav-menu">
        <ul>
          <li :class="{ active: $route.path === '/' }" @click="$router.push('/')">
            <i class='bx bxs-dashboard'></i>
            <span>Dashboard</span>
          </li>
          <li :class="{ active: $route.path === '/products' }" @click="$router.push('/products')">
            <i class='bx bxs-shopping-bag'></i>
            <span>Sản Phẩm</span>
          </li>
          <li class="nav-divider"></li>
          <li>
            <i class='bx bxs-cog'></i>
            <span>Cài đặt</span>
          </li>
        </ul>
      </nav>
    </aside>

    <div class="main-area">
      <header class="top-header">

        <div class="user-profile-wrapper">
          <div class="notification-btn">
            <i class='bx bx-bell'></i>
            <span class="badge"></span>
          </div>
          
          <div class="user-info-card">
            <div class="avatar">
              {{ user.email.charAt(0).toUpperCase() }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ user.email.split('@')[0] }}</span>
              <span class="user-role">{{ role === 'admin' ? 'Administrator' : 'Nhân viên' }}</span>
            </div>
            <button @click="logout" class="logout-btn" title="Đăng xuất">
              <i class='bx bx-log-out'></i>
            </button>
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
    }
  },
  computed: {
    // Tự động thay đổi tiêu đề dựa trên route hiện tại
    getPageTitle() {
      if (this.$route.path === '/') return 'Dashboard Overview';
      if (this.$route.path === '/products') return 'Quản Lý Sản Phẩm';
      return 'Trang Quản Trị';
    }
  },
  methods: {
    handleLogin(user) {
      this.user = user
      this.loadRole()
    },
    async loadRole() {
      if (!this.user) {
        this.role = 'staff';
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', this.user.id)
        .maybeSingle();

      if (error || !data) {
        this.role = 'staff';
      } else {
        this.role = data.role || 'staff';
      }
    },
    async logout() {
      await supabase.auth.signOut()
      this.user = null
      this.role = 'staff'
      this.$router.push('/'); // Về trang chủ sau khi logout
    }
  }
}
</script>

<style scoped>
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

/* --- 2. NẾU TRÌNH DUYỆT CŨ KHÔNG HỖ TRỢ :HAS --- */
/* Bạn có thể dùng cách thủ công hơn là thêm class vào body trong script */
/* --- RESET & VARIABLES --- */
:root {
  --primary-color: #ff9900; /* Màu tím xanh giống hình */
  --secondary-color: #F4F7FE; /* Màu nền xám nhạt */
  --text-dark: #0f1016;
  --text-gray: #A3AED0;
  --white: #ffffff;
}

/* --- LAYOUT CHUNG --- */
.app-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #F4F7FE; /* Nền tổng thể màu xám nhạt */
  color: #2B3674;
  overflow: hidden;
}

/* --- SIDEBAR --- */
.sidebar {
  width: 250px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 30px 20px;
  transition: all 0.3s ease;
  /* Nếu muốn sidebar tách biệt hẳn như hình thì không cần border-right */
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 50px;
  padding-left: 10px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ffbb00 0%, #ff9900 100%);
  color: white;
  font-weight: bold;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: #2B3674;
}

.nav-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  margin-bottom: 8px;
  border-radius: 10px;
  cursor: pointer;
  color: #A3AED0; /* Màu xám cho item chưa active */
  font-weight: 500;
  transition: all 0.2s;
}

.nav-menu li i {
  font-size: 20px;
  margin-right: 15px;
}

.nav-menu li:hover {
  color: #ff9900;
  background-color: rgb(119 119 119 / 5%);
}

/* Active State - Giống hình */
.nav-menu li.active {
  color: #ff9900;
  font-weight: 700;
  position: relative;
}
.nav-menu li.active::after {
  content: '';
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  height: 36px;
  width: 4px;
  background-color: #ff9900;
  border-radius: 4px;
}

.nav-divider {
  height: 1px;
  background-color: #eee;
  margin: 20px 10px !important;
  padding: 0 !important;
}

/* --- MAIN AREA --- */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* --- HEADER --- */
.top-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  /* Header trong suốt hòa vào nền */
}

.header-title h2 {
  font-size: 14px;
  color: #707EAE;
  font-weight: 500;
  margin: 0;
}
/* Giả lập breadcrumb style: Dashboard / Overview */
.header-title h2::before {
  content: 'Pages / ';
  font-size: 14px;
  color: #707EAE;
  font-weight: 400;
}
/* Style lại text chính to hơn 1 chút */
.header-title h2 {
  display: flex;
  flex-direction: column;
}
.header-title h2::after {
  content: attr(data-title); /* Nếu muốn dynamic */
  font-size: 30px;
  color: #2B3674;
  font-weight: 700;
  margin-top: 5px;
}

/* User Profile Section - Đẹp như hình */
.user-profile-wrapper {
  background: #ffffff;
  padding: 10px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08);
}

.notification-btn {
  position: relative;
  cursor: pointer;
  color: #A3AED0;
  font-size: 20px;
  margin-left: 10px;
}
.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 6px;
  height: 6px;
  background-color: red;
  border-radius: 50%;
}

.user-info-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #fa9600; /* Màu đậm để nổi bật text trắng */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 700;
  color: #2B3674;
}

.user-role {
  font-size: 12px;
  color: #A3AED0;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #A3AED0;
  font-size: 20px;
  transition: color 0.2s;
  padding: 5px;
}

.logout-btn:hover {
  color: #E03131;
}

/* --- CONTENT --- */
.content-wrapper {
  flex: 1;
  padding: 0 30px 30px 30px;
  overflow-y: auto;
}
</style>