<template>
  <!-- Màn hình login - giữ y nguyên cấu trúc và class của bạn -->
    <div class="login-container">
        <div class="main-content">
          <div class="content-wrapper">
            <div class="header-section">
              <h1 class="heading-1">Sign In</h1>
              <p class="subtitle">Đăng nhập để tiếp tục sử dụng</p>
            </div>

            <div class="grid-layout">
              <div class="intro-section">
                <h2 class="heading-2">Hệ thống quản lý bán hàng</h2>
                <p class="intro-text">
                  Đây là giải pháp quản lý bán hàng hoàn hảo cho cửa hàng của bạn.
                  Theo dõi sản phẩm, đơn hàng và khách hàng một cách dễ dàng.
                </p>
              </div>

                <div class="login-form">
                    <form @submit.prevent="login">
                        <div class="form-group">
                        <input v-model="email" type="email" class="form-input" placeholder=" " required />
                        <label class="form-label">Email</label>
                        </div>

                        <div class="form-group">
                        <input v-model="password" type="password" class="form-input" placeholder=" " required />
                        <label class="form-label">Mật khẩu</label>
                        </div>

                        <p class="message">{{ message }}</p>

                        <button type="submit" class="main-button">Đăng nhập</button>

                        <div class="divider-section">
                        <div class="divider-content">
                            <h3>Hoặc</h3>
                            <button type="button" class="button-gg" disabled>
                            <img src="https://www.google.com/favicon.ico" alt="Google">
                            <span>Đăng nhập với Google</span>
                            </button>
                        </div>
                        </div>
                    </form>
                </div>
            </div>
                <div class="footer-section">
                    <p class="subtitle">© Copyright @ 2025 Trung Tu. All Rights Reserved</p>
                </div>
          </div>
        </div>
    </div>
</template>
<script>
import { supabase } from '../supabaseClient'

export default {
  data() {
    return {
      email: '',
      password: '',
      message: '',
      loading: false
    }
  },
  methods: {
    async login() {
      this.loading = true;
      this.message = '';

      try {
        // 1. Đăng nhập Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: this.email,
          password: this.password
        });

        if (authError) throw authError;

        // 2. Lấy thông tin Profile (Quan trọng: Lấy Role)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        // Nếu không lấy được profile (do lỗi mạng hoặc db), ta vẫn cho login nhưng cảnh báo
        if (profileError) {
            console.warn("Chưa tải được hồ sơ chi tiết:", profileError);
        }

        // 3. Gộp thông tin
        const currentUser = {
            ...authData.user,
            user_metadata: {
                ...authData.user.user_metadata,
                ...(profileData || { role: 'staff', full_name: 'Unknown' }) // Fallback nếu lỗi
            }
        };

        // 4. Emit lên App cha
        this.$emit('logged-in', currentUser);

      } catch (error) {
        console.error(error);
        this.message = error.message;
        if (error.message.includes("Invalid login")) {
            this.message = "Sai email hoặc mật khẩu!";
        } else if (error.status === 500) {
            this.message = "Lỗi hệ thống (500). Vui lòng báo Admin kiểm tra Database Trigger.";
        }
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
<style scoped>
/* Giữ nguyên CSS login của bạn ở đây hoặc import từ file chung */
</style>