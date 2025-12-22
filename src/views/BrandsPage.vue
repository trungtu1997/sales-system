<template>
  <div class="products-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Quản Lý Thương Hiệu</h1>
        <ul class="breadcrumb">
          <li>Trang chủ</li>
          <li class="separator">/</li>
          <li class="active">Thương hiệu</li>
        </ul>
      </div>
      <div class="header-actions">
        <button @click="openForm()" class="btn btn-black">
          <span class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </span> Thêm thương hiệu
        </button>
        <button class="btn btn-white" @click="exportToExcel">
          <i class="fas fa-file-excel" style="color: #107c41; margin-right: 8px;"></i> Xuất Excel
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper mono">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Tổng thương hiệu</span>
          <h3 class="stat-value">{{ brands.length }}</h3>
          <span class="stat-sub">Đối tác & Hãng</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper mono">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Có Logo</span>
          <h3 class="stat-value">{{ hasLogoCount }}</h3>
          <span class="stat-sub">Đã cập nhật ảnh</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper mono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Chưa có Logo</span>
          <h3 class="stat-value">{{ noLogoCount }}</h3>
          <span class="stat-sub">Cần bổ sung</span>
        </div>
      </div>
      
       <div class="stat-card" style="opacity: 0.5; border-style: dashed;">
        <div class="stat-icon-wrapper mono" style="background: #eee; color: #999;">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Slot trống</span>
          <h3 class="stat-value">--</h3>
          <span class="stat-sub">Coming soon</span>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          v-model="searchQuery" 
          placeholder="Tìm kiếm thương hiệu..." 
          class="search-input" 
        />
      </div>
      </div>

    <div class="table-card">
      <table class="product-table">
        <thead>
          <tr>
            <th>LOGO</th>
            <th>TÊN THƯƠNG HIỆU</th>
            <th class="text-right">HÀNH ĐỘNG</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedBrands.length === 0">
            <td colspan="3" class="text-center empty-state">Không tìm thấy thương hiệu nào</td>
          </tr>
          <tr v-for="brand in paginatedBrands" :key="brand.id">
            <td>
              <div class="product-avatar brand-avatar">
                <img 
                  v-if="brand.logo_url" 
                  :src="brand.logo_url" 
                  class="product-img"
                  @error="$event.target.style.display='none'"
                />
                <div v-else class="mono-avatar">
                  {{ brand.name.charAt(0).toUpperCase() }}
                </div>
              </div>
            </td>
            <td>
               <span class="product-name-text">{{ brand.name }}</span>
            </td>
            
            <td class="actions text-right">
              <button class="action-btn edit" @click="openForm(brand)" title="Chỉnh sửa">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="action-btn delete" @click="deleteBrand(brand.id)" title="Xóa">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-wrapper">
      <div class="pagination-info">
        Hiển thị <strong>{{ (currentPage - 1) * pageSize + 1 }}</strong> - <strong>{{ Math.min(currentPage * pageSize, filteredBrands.length) }}</strong> của <strong>{{ filteredBrands.length }}</strong> thương hiệu
      </div>
      <div class="pagination-controls">
        <button @click="currentPage--" :disabled="currentPage === 1" class="btn-page-nav">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div class="page-numbers">
           <button class="page-number active">{{ currentPage }}</button>
        </div>
        <button @click="currentPage++" :disabled="currentPage === totalPages" class="btn-page-nav">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>

    <div v-if="showForm" class="modal-overlay" @click="showForm = false">
      <div class="modal-card small-modal" @click.stop>
        <div class="modal-header">
           <h2>{{ editingBrand ? 'Cập Nhật Thương Hiệu' : 'Thêm Thương Hiệu Mới' }}</h2>
           <button class="btn-close-modal" @click="showForm = false">&times;</button>
        </div>
        
        <form @submit.prevent="saveBrand" class="product-form">
          <div class="form-scrollable-content">
              <div class="form-section-title">Thông tin</div>
              <div class="form-grid single-col">
                <div class="form-group">
                  <label>Tên thương hiệu <span class="required">*</span></label>
                  <input v-model="form.name" required class="form-input" placeholder="Ví dụ: Apple, Samsung, Nike..." />
                </div>
                
                <div class="form-group">
                  <label>Logo URL</label>
                  <input v-model="form.logo_url" class="form-input" placeholder="Link ảnh logo..." />
                  
                  <div v-if="form.logo_url" class="preview-logo-box">
                      <p style="font-size: 11px; color: #666; margin-bottom: 4px;">Xem trước:</p>
                      <img :src="form.logo_url" class="preview-logo-img" />
                  </div>
                </div>
              </div>
          </div>

          <div class="form-footer">
            <button type="button" @click="showForm = false" class="btn-cancel">Hủy bỏ</button>
            <button type="submit" class="btn-save">Lưu Thương Hiệu</button>
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
      brands: [],
      searchQuery: '',
      currentPage: 1,
      pageSize: 10,
      
      // Form Data
      showForm: false,
      editingBrand: null,
      form: {
        name: '',
        logo_url: ''
      }
    }
  },
  
  async mounted() {
    await this.loadBrands();
  },

  computed: {
    // Logic lọc
    filteredBrands() {
      return this.brands.filter(b => {
        const query = this.searchQuery.toLowerCase();
        return b.name && b.name.toLowerCase().includes(query);
      })
    },

    paginatedBrands() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredBrands.slice(start, start + this.pageSize);
    },
    totalPages() { return Math.ceil(this.filteredBrands.length / this.pageSize) || 1; },
    
    // Stats logic
    hasLogoCount() { return this.brands.filter(b => b.logo_url && b.logo_url.trim() !== '').length; },
    noLogoCount() { return this.brands.filter(b => !b.logo_url || b.logo_url.trim() === '').length; }
  },

  methods: {
    // --- LOAD DATA ---
    async loadBrands() {
      // Sắp xếp theo tên để tránh lỗi created_at
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });

      if (error) console.error('Lỗi load brands:', error);
      else this.brands = data || [];
    },

    // --- FORM LOGIC ---
    openForm(brand = null) {
      this.editingBrand = brand;
      if (brand) {
        this.form = { ...brand };
      } else {
        this.form = {
          name: '',
          logo_url: ''
        };
      }
      this.showForm = true;
    },

    async saveBrand() {
      try {
        const payload = {
            name: this.form.name,
            logo_url: this.form.logo_url
        };

        if (this.editingBrand) {
            const { error } = await supabase.from('brands').update(payload).eq('id', this.editingBrand.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('brands').insert(payload);
            if (error) throw error;
        }

        alert('Lưu thương hiệu thành công!');
        this.showForm = false;
        await this.loadBrands();

      } catch (err) {
        console.error("Lỗi Save:", err);
        alert('Có lỗi xảy ra: ' + err.message);
      }
    },

    async deleteBrand(id) {
        // Có thể check xem có sản phẩm nào dùng brand này không trước khi xóa
        // Nhưng tạm thời làm đơn giản trước
        if(confirm("Bạn có chắc muốn xóa thương hiệu này?")) {
            const { error } = await supabase.from('brands').delete().eq('id', id);
            if (error) {
                // Supabase sẽ báo lỗi foreign key constraint nếu brand đang được dùng trong Products
                if(error.code === '23503') { // Mã lỗi foreign key phổ biến của Postgres
                    alert("Không thể xóa: Thương hiệu này đang được gắn cho sản phẩm.");
                } else {
                    alert("Lỗi khi xóa: " + error.message);
                }
            } else {
                this.loadBrands();
            }
        }
    },

    // --- EXCEL ---
    exportToExcel() {
      if (this.brands.length === 0) return alert("Không có dữ liệu để xuất");
      const data = this.brands.map(b => ({
          'Tên': b.name,
          'Logo': b.logo_url || 'N/A'
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Brands");
      XLSX.writeFile(wb, "Danh_Sach_ThuongHieu.xlsx");
    }
  }
}
</script>

<style scoped>
/* =========================================
   STYLE GLOBAL (COPY TỪ PRODUCTS & CATEGORIES)
   ========================================= */

* { box-sizing: border-box; }

.products-page {
  padding: 32px 40px;
  max-width: 1100px;
  background-color: #ffffff;
  min-height: 100vh;
  color: #1f2937;
  margin: auto;
  border-radius: 10px;
}
.products-page ::placeholder, .products-page select {
  font-family: 'Quicksand',-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* HEADER & ACTIONS */
.page-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 30px; flex-wrap: wrap; gap: 20px;
}
.page-title { font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 8px 0; }
.breadcrumb { display: flex; list-style: none; padding: 0; margin: 0; color: #6b7280; font-size: 14px; }
.breadcrumb .separator { margin: 0 8px; color: #d1d5db; }
.breadcrumb .active { color: #374151; font-weight: 500; }
.breadcrumb .icon { margin-right: 4px; }
.header-actions { display: flex; gap: 12px; }

/* BUTTONS */
.btn {
  padding: 10px 20px; border-radius: 0.2rem; font-weight: 600; font-size: 14px;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; transition: all 0.2s; white-space: nowrap;
}
.btn-black { background: #000000; color: #ffffff; border: 1px solid #000000; }
.btn-black:hover { background: #333333; border-color: #333333; }
.btn-white { background: #ffffff; border: 1px solid #e5e7eb; color: #374151; }
.btn-white:hover { background: #f9fafb; border-color: #d1d5db; }
.icon { font-size: 16px; line-height: 1; }

/* STATS GRID */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 32px; }
.stat-card {
  background: white; border-radius: 12px; padding: 24px;
  display: flex; align-items: center; gap: 20px;
  border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.stat-card:hover { transform: translateY(-5px); transition: 0.5s; background: #fbfbfb; }
.stat-icon-wrapper.mono {
  width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: #ffb300; color: #ffffff;
}
.stat-icon-wrapper svg { width: 24px; height: 24px; }
.stat-content { display: flex; flex-direction: column; }
.stat-label { color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
.stat-value { font-size: 24px; font-weight: 700; color: #111827; margin: 0; }
.stat-sub { color: #9ca3af; font-size: 12px; margin-top: 2px; }

/* FILTER BAR */
.filter-bar { display: flex; justify-content: space-between; margin-bottom: 24px; gap: 20px; flex-wrap: wrap; }
.search-wrapper { position: relative; flex: 1; min-width: 300px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; color: #9ca3af; }
.search-input { width: 100%; padding: 10px 10px 10px 40px; border: 1px solid #e5e7eb; border-radius: 0.2rem; outline: none; font-size: 14px; min-height: 42px; }
.search-input:focus { border-color: #000; }

/* TABLE */
.table-card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow-x: auto; margin-bottom: 24px; }
.product-table { width: 100%; border-collapse: collapse; min-width: 900px; }
.product-table th { background: #f9fafb; padding: 14px 20px; text-align: center; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
.product-table td { padding: 14px 20px; vertical-align: middle; font-size: 14px; color: #374151; }
.product-table tr { border-bottom: 1px solid #f3f4f6; }
.product-table tr:hover { background: #f7f7f7; }

/* Cells & Badges */
.product-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 1px solid #e5e7eb; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.product-img { width: 100%; height: 100%; object-fit: cover; } /* Logo tròn */
.brand-avatar { width: 48px; height: 48px; margin: auto; } /* Brand logo to hơn xíu */
.product-avatar .mono-avatar { width: 100%; height: 100%; background: #f3f4f6; color: #000; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; }
.product-name-text { font-weight: 600; color: #111827; }

.actions { display: flex; justify-content: center; gap: 6px; }
.action-btn { width: 40px; height: 40px; border-radius: 50%; background: white; color: #6b7280; display: grid; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; border: none; }
.action-btn:hover { color: #000; background: rgb(240, 239, 239) }
.action-btn svg { width: 16px; height: 16px; }
.text-right { text-align: right; }
.text-center { text-align: center; }

/* Pagination */
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
.form-input { padding: 10px; border: 1px solid #e9eaeb; border-radius: 0.2rem; font-size: 14px; outline: none; width: 100%; }
.form-input:focus { border-color: #000; }

.preview-logo-box { margin-top: 10px; padding: 10px; border: 1px dashed #e5e5e5; border-radius: 4px; display: flex; flex-direction: column; align-items: center; background: #fafafa; }
.preview-logo-img { max-height: 80px; max-width: 100%; object-fit: contain; }

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