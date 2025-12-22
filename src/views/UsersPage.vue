<template>
  <div class="products-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Quản Lý Nhân Viên</h1>
        <ul class="breadcrumb">
          <li>Trang chủ</li>
          <li class="separator">/</li>
          <li class="active">Hồ sơ & Phân quyền</li>
        </ul>
      </div>
      <div class="header-actions">
        <button @click="openForm()" class="btn btn-black">
          <span class="icon">+</span> Thêm nhân viên
        </button>
        <button class="btn btn-white" @click="exportToExcel">
          <i class="fas fa-file-excel" style="color: #107c41; margin-right: 8px;"></i> Xuất Excel
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper mono">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Tổng nhân sự</span>
          <h3 class="stat-value">{{ profiles.length }}</h3>
          <span class="stat-sub">Tài khoản hệ thống</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper mono">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Quản trị viên</span>
          <h3 class="stat-value">{{ adminCount }}</h3>
          <span class="stat-sub">Quyền Admin</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper mono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Nhân viên</span>
          <h3 class="stat-value">{{ staffCount }}</h3>
          <span class="stat-sub">Các bộ phận khác</span>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          v-model="searchQuery" 
          placeholder="Tìm theo tên, email..." 
          class="search-input" 
        />
      </div>
      <div class="filter-actions">
        <select class="filter-select" v-model="filterRole">
          <option value="">Tất cả vai trò</option>
          <option value="admin">Quản Trị Viên</option>
          <option value="manager">Quản Lý Kho</option>
          <option value="staff">Nhân Viên Sale</option>
          <option value="accountant">Kế Toán</option>
        </select>
      </div>
    </div>

    <div class="table-card">
      <table class="product-table">
        <thead>
          <tr>
            <th>AVATAR</th>
            <th>HỌ VÀ TÊN</th>
            <th>EMAIL (LOGIN)</th>
            <th>VAI TRÒ</th>
            <th class="text-right">HÀNH ĐỘNG</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedProfiles.length === 0">
            <td colspan="5" class="text-center empty-state">Không tìm thấy nhân viên nào</td>
          </tr>
          <tr v-for="p in paginatedProfiles" :key="p.id">
            <td>
              <div class="product-avatar">
                <div class="mono-avatar">{{ getInitials(p.email) }}</div>
              </div>
            </td>
            <td><span class="product-name-text">{{ p.full_name || '---' }}</span></td>
            <td><span class="sku-tag" style="text-transform: none;">{{ p.email }}</span></td>
            <td>
                <span class="category-tag" :class="{'admin-tag': p.role === 'admin'}">
                    {{ getRoleLabel(p.role) }}
                </span>
            </td>
            <td class="actions text-right">
              <button class="action-btn edit" @click="openForm(p)" title="Chỉnh sửa">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="action-btn delete" @click="deleteUser(p.id)" title="Xóa nhân viên">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-wrapper">
      <div class="pagination-info">
        Hiển thị <strong>{{ (currentPage - 1) * pageSize + 1 }}</strong> - <strong>{{ Math.min(currentPage * pageSize, filteredProfiles.length) }}</strong> của <strong>{{ filteredProfiles.length }}</strong>
      </div>
      <div class="pagination-controls">
        <button @click="currentPage--" :disabled="currentPage === 1" class="btn-page-nav">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div class="page-numbers"><button class="page-number active">{{ currentPage }}</button></div>
        <button @click="currentPage++" :disabled="currentPage === totalPages" class="btn-page-nav">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>

    <div v-if="showForm" class="modal-overlay" @click="showForm = false">
      <div class="modal-card small-modal" @click.stop>
        <div class="modal-header">
           <h2>{{ editingProfile ? 'Cập Nhật Hồ Sơ' : 'Thêm Nhân Viên Mới' }}</h2>
           <button class="btn-close-modal" @click="showForm = false">&times;</button>
        </div>
        
        <form @submit.prevent="saveUser" class="product-form">
          <div class="form-scrollable-content">
              <div class="form-grid single-col">
                <div class="form-group">
                  <label>Email đăng nhập <span class="required">*</span></label>
                  <input v-model="form.email" :disabled="!!editingProfile" required type="email" class="form-input" placeholder="user@company.com" />
                </div>

                <div v-if="!editingProfile" class="form-group">
                  <label>Mật khẩu <span class="required">*</span></label>
                  <input v-model="form.password" required type="password" class="form-input" placeholder="******" />
                </div>

                <div class="form-group">
                  <label>Họ và tên hiển thị <span class="required">*</span></label>
                  <input v-model="form.full_name" required class="form-input" placeholder="Nguyễn Văn A" />
                </div>
                
                <div class="form-group">
                  <label>Vai trò (Role) <span class="required">*</span></label>
                  <select v-model="form.role" required class="form-select">
                    <option value="admin">Quản Trị Viên</option>
                    <option value="manager">Quản Lý Kho</option>
                    <option value="staff">Nhân Viên Sale</option>
                    <option value="accountant">Kế Toán</option>
                  </select>
                </div>
              </div>
          </div>

          <div class="form-footer">
            <button type="button" @click="showForm = false" class="btn-cancel">Hủy bỏ</button>
            <button type="submit" class="btn-save">{{ editingProfile ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản' }}</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script>
import { supabase } from '../supabaseClient'
import * as XLSX from 'xlsx'

export default {
  data() {
    return {
      profiles: [],
      searchQuery: '',
      filterRole: '',
      currentPage: 1,
      pageSize: 10,
      
      showForm: false,
      editingProfile: null,
      form: {
        id: '',
        email: '',
        password: '',
        full_name: '',
        role: 'staff'
      }
    }
  },
  
  async mounted() {
    await this.loadProfiles();
  },

  computed: {
    filteredProfiles() {
      return this.profiles.filter(p => {
        const query = this.searchQuery.toLowerCase();
        
        // --- SỬA LOGIC TÌM KIẾM ---
        let matchesSearch = true;
        
        // Chỉ khi nào có nhập từ khóa (query khác rỗng) thì mới đi soi tên/email
        if (query) {
             matchesSearch = (p.full_name && p.full_name.toLowerCase().includes(query)) || 
                             (p.email && p.email.toLowerCase().includes(query));
        }
        // ---------------------------
        
        const matchesRole = !this.filterRole || p.role === this.filterRole;

        return matchesSearch && matchesRole;
      })
    },
    paginatedProfiles() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredProfiles.slice(start, start + this.pageSize);
    },
    totalPages() { return Math.ceil(this.filteredProfiles.length / this.pageSize) || 1; },
    adminCount() { return this.profiles.filter(p => p.role === 'admin').length; },
    staffCount() { return this.profiles.filter(p => p.role !== 'admin').length; }
  },

  methods: {
    async loadProfiles() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error('Lỗi load profiles:', error);
      else this.profiles = data || [];
    },

    getRoleLabel(roleCode) {
        const map = { 'admin': 'Quản Trị Viên', 'staff': 'Nhân Viên', 'manager': 'Quản Lý Kho', 'accountant': 'Kế Toán' };
        return map[roleCode] || roleCode || 'Chưa phân quyền';
    },

    getInitials(email) {
        return email ? email.charAt(0).toUpperCase() : 'U';
    },

    openForm(profile = null) {
      this.editingProfile = profile;
      if (profile) {
        this.form = { 
          id: profile.id, email: profile.email, full_name: profile.full_name, 
          role: profile.role || 'staff', password: '' 
        };
      } else {
        this.form = { email: '', password: '', full_name: '', role: 'staff' };
      }
      this.showForm = true;
    },

    async saveUser() {
      try {
        if (!this.form.email || !this.form.full_name || !this.form.role) {
            alert("Vui lòng điền đủ thông tin!"); return;
        }

        if (this.editingProfile) {
          // UPDATE
          const { error } = await supabase
            .from('profiles')
            .update({ full_name: this.form.full_name, role: this.form.role })
            .eq('id', this.form.id);
          if (error) throw error;
          alert('Cập nhật thành công!');
        } else {
          // CREATE (Dùng RPC)
          if (!this.form.password) { alert("Nhập mật khẩu!"); return; }
          const { error } = await supabase.rpc('create_user_v2', {
            new_email: this.form.email,
            new_password: this.form.password,
            new_full_name: this.form.full_name,
            new_role: this.form.role
          });
          if (error) throw error;
          alert('Tạo nhân viên thành công!');
        }
        this.showForm = false;
        await this.loadProfiles(); // SỬA LẠI TÊN HÀM Ở ĐÂY CHO ĐÚNG
      } catch (err) {
        console.error("Lỗi:", err);
        alert('Có lỗi xảy ra: ' + err.message);
      }
    },

    // --- HÀM XÓA ĐÃ ĐƯỢC THÊM MỚI ---
    async deleteUser(id) {
        // Kiểm tra xem có đang xóa chính mình không
        const currentUser = await supabase.auth.getUser();
        if (currentUser.data.user && currentUser.data.user.id === id) {
            alert("Bạn không thể tự xóa tài khoản đang đăng nhập!");
            return;
        }

        if(confirm("Bạn có chắc muốn xóa nhân viên này? Hành động này sẽ xóa vĩnh viễn tài khoản.")) {
            try {
                // Gọi hàm RPC xóa user v2 (đã tạo ở SQL trước đó)
                const { error } = await supabase.rpc('delete_user_v2', {
                    user_id: id
                });

                if (error) throw error;

                alert("Đã xóa nhân viên thành công!");
                await this.loadProfiles(); // Tải lại danh sách

            } catch (err) {
                console.error("Lỗi xóa:", err);
                alert("Không thể xóa: " + (err.message || err.details));
            }
        }
    },

    exportToExcel() {
      if (this.profiles.length === 0) return alert("Không có dữ liệu");
      const data = this.profiles.map(p => ({
          'Họ Tên': p.full_name, 'Email': p.email, 'Vai trò': this.getRoleLabel(p.role)
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "NhanSu");
      XLSX.writeFile(wb, "Danh_Sach_NhanSu.xlsx");
    }
  }
}
</script>

<style scoped>
/* =========================================
   STYLE GLOBAL
   ========================================= */
* { box-sizing: border-box; }
.products-page { padding: 32px 40px; max-width: 1100px; background-color: #ffffff; min-height: 100vh; color: #1f2937; margin: auto; border-radius: 10px; }
.products-page ::placeholder, .products-page select { font-family: 'Quicksand',-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }

/* HEADER */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; flex-wrap: wrap; gap: 20px; }
.page-title { font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 8px 0; }
.breadcrumb { display: flex; list-style: none; padding: 0; margin: 0; color: #6b7280; font-size: 14px; }
.breadcrumb .separator { margin: 0 8px; color: #d1d5db; }
.breadcrumb .active { color: #374151; font-weight: 500; }
.header-actions { display: flex; gap: 12px; }

/* BUTTONS */
.btn { padding: 10px 20px; border-radius: 0.2rem; font-weight: 600; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; white-space: nowrap; }
.btn-black { background: #000000; color: #ffffff; border: 1px solid #000000; }
.btn-black:hover { background: #333333; border-color: #333333; }
.btn-white { background: #ffffff; border: 1px solid #e5e7eb; color: #374151; }
.btn-white:hover { background: #f9fafb; border-color: #d1d5db; }
.icon { font-size: 16px; line-height: 1; }

/* STATS */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
.stat-card { background: white; border-radius: 12px; padding: 24px; display: flex; align-items: center; gap: 20px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.stat-card:hover { transform: translateY(-5px); transition: 0.5s; background: #fbfbfb; }
.stat-icon-wrapper.mono { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #ffb300; color: #ffffff; }
.stat-icon-wrapper svg { width: 24px; height: 24px; }
.stat-content { display: flex; flex-direction: column; }
.stat-label { color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
.stat-value { font-size: 24px; font-weight: 700; color: #111827; margin: 0; }
.stat-sub { color: #9ca3af; font-size: 12px; margin-top: 2px; }

/* FILTER */
.filter-bar { display: flex; justify-content: space-between; margin-bottom: 24px; gap: 20px; flex-wrap: wrap; }
.search-wrapper { position: relative; flex: 1; min-width: 300px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; color: #9ca3af; }
.search-input { width: 100%; padding: 10px 10px 10px 40px; border: 1px solid #e5e7eb; border-radius: 0.2rem; outline: none; font-size: 14px; min-height: 42px; }
.search-input:focus { border-color: #000; }
.filter-actions { display: flex; gap: 12px; }
.filter-select { padding: 10px 30px 10px 15px; border: 1px solid #e5e7eb; border-radius: 0.2rem; background: white; outline: none; cursor: pointer; font-size: 14px; }

/* TABLE */
.table-card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow-x: auto; margin-bottom: 24px; }
.product-table { width: 100%; border-collapse: collapse; min-width: 900px; }
.product-table th { background: #f9fafb; padding: 14px 20px; text-align: left; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
.product-table td { padding: 14px 20px; vertical-align: middle; font-size: 14px; color: #374151; }
.product-table tr { border-bottom: 1px solid #f3f4f6; }
.product-table tr:hover { background: #f7f7f7; }

/* ITEMS */
.product-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 1px solid #e5e7eb; flex-shrink: 0; }
.product-avatar .mono-avatar { width: 100%; height: 100%; background: #f3f4f6; color: #000; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
.product-name-text { font-weight: 600; color: #111827; }
.sku-tag { padding: 4px 8px; border-radius: 0.2rem; font-size: 12px; background: #f3f4f6; color: #666; font-family: monospace; }
.category-tag { background: #e5e7eb; color: #374151; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid #d1d5db; }
.category-tag.admin-tag { background: #000; color: #fff; border-color: #000; }
.actions { display: flex; justify-content: flex-end; gap: 6px; }
.action-btn { width: 40px; height: 40px; border-radius: 50%; background: white; color: #6b7280; display: grid; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; border: none; }
.action-btn:hover { color: #000; background: rgb(240, 239, 239) }
.action-btn svg { width: 16px; height: 16px; }
.text-right { text-align: right; }
.text-center { text-align: center; }

/* PAGINATION */
.pagination-wrapper { display: flex; justify-content: space-between; align-items: center; padding: 0 8px; flex-wrap: wrap; gap: 10px; }
.pagination-controls { display: flex; gap: 8px; }
.btn-page-nav, .page-number { width: 40px; height: 40px; display: grid; align-items: center; justify-content: center; border: 1px solid #e5e7eb; background: white; border-radius: 50%; cursor: pointer; }
.page-number.active { background: #000; color: white; border-color: #000; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
.modal-card { background: white; width: 500px; max-width: 95vw; max-height: 90vh; border-radius: 0.2rem; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
.modal-header { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { margin: 0; font-size: 18px; font-weight: 700; }
.btn-close-modal { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; }
.product-form { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
.form-scrollable-content { flex: 1; overflow-y: auto; padding: 24px; }
.form-grid.single-col { display: grid; grid-template-columns: 1fr; gap: 15px; } 
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; text-align: justify; }
.required { color: red; }
.form-input, .form-select { padding: 10px; border: 1px solid #e9eaeb; border-radius: 0.2rem; font-size: 14px; outline: none; width: 100%; }
.form-input:focus { border-color: #000; }
.form-input:disabled { background: #f3f4f6; cursor: not-allowed; }
.form-footer { padding: 20px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px; background: white; }
.btn-save { background: #000; color: white; border: none; padding: 10px 24px; border-radius: 0.2rem; font-weight: 600; cursor: pointer; }
.btn-cancel { background: white; border: 1px solid #e5e7eb; padding: 10px 20px; border-radius: 0.2rem; cursor: pointer; }

/* RESPONSIVE */
@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) {
  .products-page { padding: 16px; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .header-actions { width: 100%; justify-content: space-between; margin-top: 10px; }
  .stats-grid { grid-template-columns: 1fr; }
  .filter-bar { flex-direction: column; }
  .search-wrapper { width: 100%; }
}
</style>