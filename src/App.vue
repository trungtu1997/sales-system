<template>
  <LoginForm v-if="!user" @logged-in="handleLogin" />

  <div v-else class="app-layout">
    <!-- Sidebar, header, content như cũ -->
    <header class="header">
      <h2>Quản Lý Bán Hàng</h2>
      <div class="user-info">
        <span>{{ role === 'admin' ? 'Admin' : 'Nhân viên' }}: {{ user.email }}</span>
        <button @click="logout">Đăng Xuất</button>
      </div>
    </header>

    <div class="main-layout">
      <aside class="sidebar">
        <ul>
          <li @click="$router.push('/')">Dashboard</li>
          <li @click="$router.push('/products')">Sản Phẩm</li>
          <!-- menu khác, v-if admin cho Báo Cáo -->
        </ul>
      </aside>

      <main class="content">
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
      currentView: 'dashboard'
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

      console.log('Đang load role cho user ID:', this.user.id); // log để check

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', this.user.id)
        .maybeSingle(); // QUAN TRỌNG: dùng maybeSingle để không lỗi khi có/không data

      if (error) {
        console.error('Lỗi Supabase khi load role:', error);
        this.role = 'staff';
      } else if (data) {
        this.role = data.role || 'staff';
        console.log('Load role thành công:', this.role);
      } else {
        console.log('Không tìm thấy profile → mặc định staff');
        this.role = 'staff';
      }
    },
    async logout() {
      await supabase.auth.signOut()
      this.user = null
      this.role = 'staff'
    }
  }
}
</script>

<style scoped>

</style>