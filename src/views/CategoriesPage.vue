<template>
  <div class="products-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Quản Lý Danh Mục</h1>
        <ul class="breadcrumb">
          <li>Trang chủ</li>
          <li class="separator">/</li>
          <li class="active">Danh mục</li>
        </ul>
      </div>
      <div class="header-actions">
        <button @click="openForm()" class="btn btn-black">
          <span class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </span> Thêm danh mục
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
          <span class="stat-label">Tổng danh mục</span>
          <h3 class="stat-value">{{ categories.length }}</h3>
          <span class="stat-sub">Toàn bộ hệ thống</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper mono">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Danh mục gốc</span>
          <h3 class="stat-value">{{ rootCategoriesCount }}</h3>
          <span class="stat-sub">Category cấp 1</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper mono">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Hoạt động</span>
          <h3 class="stat-value">{{ activeCount }}</h3>
          <span class="stat-sub">Đang hiển thị</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper mono">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Đang ẩn</span>
          <h3 class="stat-value">{{ inactiveCount }}</h3>
          <span class="stat-sub">Tạm ngưng</span>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          v-model="searchQuery" 
          placeholder="Tìm kiếm danh mục..." 
          class="search-input" 
        />
      </div>
      <div class="filter-actions">
        <select class="filter-select" v-model="filterParent">
          <option value="">Tất cả cấp cha</option>
          <option value="root">Chỉ danh mục gốc</option>
          <option v-for="cat in rootCategories" :key="cat.id" :value="cat.id">
             Con của: {{ cat.name }}
          </option>
        </select>
        
        <select class="filter-select" v-model="filterStatus">
          <option value="">Tất cả trạng thái</option>
          <option :value="true">Hoạt động</option>
          <option :value="false">Đang ẩn</option>
        </select>
      </div>
    </div>

    <div class="table-card">
      <table class="product-table">
        <thead>
          <tr>
            <th style="width: 80px">ICON</th>
            <th>TÊN DANH MỤC</th>
            <th>SLUG</th>
            <th>DANH MỤC CHA</th>
            <th>TRẠNG THÁI</th>
            <th class="text-right">HÀNH ĐỘNG</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedCategories.length === 0">
            <td colspan="6" class="text-center empty-state">Không tìm thấy danh mục nào</td>
          </tr>
          <tr v-for="cat in paginatedCategories" :key="cat.id">
            <td>
              <div class="product-avatar">
                <img 
                  v-if="cat.icon" 
                  :src="cat.icon" 
                  class="product-img"
                  @error="$event.target.style.display='none'"
                />
                <div v-else class="mono-avatar">
                  {{ cat.name.charAt(0).toUpperCase() }}
                </div>
              </div>
            </td>
            <td>
               <span class="product-name-text">{{ cat.name }}</span>
            </td>
            <td>
                <span class="sku-tag">{{ cat.slug }}</span>
            </td>
            <td>
                <span v-if="cat.parent_id" class="category-tag">
                    {{ getParentName(cat.parent_id) }}
                </span>
                <span v-else class="text-muted" style="font-size:12px; font-style: italic;">-- Gốc --</span>
            </td>
            <td>
              <span class="stock-badge" :class="cat.is_active ? 'in-stock' : 'out-stock'">
                {{ cat.is_active ? 'Hoạt động' : 'Đang ẩn' }}
              </span>
            </td>
            
            <td class="actions text-right">
              <button class="action-btn edit" @click="openForm(cat)" title="Chỉnh sửa">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="action-btn delete" @click="deleteCategory(cat.id)" title="Xóa">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-wrapper">
      <div class="pagination-info">
        Hiển thị <strong>{{ (currentPage - 1) * pageSize + 1 }}</strong> - <strong>{{ Math.min(currentPage * pageSize, filteredCategories.length) }}</strong> của <strong>{{ filteredCategories.length }}</strong> danh mục
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
           <h2>{{ editingCategory ? 'Cập Nhật Danh Mục' : 'Thêm Danh Mục Mới' }}</h2>
           <button class="btn-close-modal" @click="showForm = false">&times;</button>
        </div>
        
        <form @submit.prevent="saveCategory" class="product-form">
          <div class="form-scrollable-content">
              <div class="form-section-title">Thông tin cơ bản</div>
              <div class="form-grid single-col">
                <div class="form-group">
                  <label>Tên danh mục <span class="required">*</span></label>
                  <input v-model="form.name" required class="form-input" placeholder="Ví dụ: Laptop, Điện thoại..." />
                </div>
                
                <div class="form-group">
                  <label>Slug (URL) <span class="required">*</span></label>
                  <input v-model="form.slug" required class="form-input" placeholder="tu-dong-theo-ten" />
                </div>

                <div class="form-group">
                  <label>Danh mục cha (Nếu có)</label>
                  <select v-model="form.parent_id" class="form-select">
                    <option :value="null">-- Là danh mục gốc --</option>
                    <option 
                        v-for="cat in availableParents" 
                        :key="cat.id" 
                        :value="cat.id"
                    >
                        {{ cat.name }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Icon / Hình ảnh (URL)</label>
                  <input v-model="form.icon" class="form-input" placeholder="https://..." />
                  <div v-if="form.icon" style="margin-top: 8px;">
                      <img :src="form.icon" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;" />
                  </div>
                </div>

                <div class="form-group checkbox-group" style="margin-top: 10px;">
                  <label class="checkbox-container">
                    <input type="checkbox" v-model="form.is_active" />
                    <span class="checkmark"></span>
                    Đang hoạt động (Hiển thị trên web)
                  </label>
                </div>
              </div>
          </div>

          <div class="form-footer">
            <button type="button" @click="showForm = false" class="btn-cancel">Hủy bỏ</button>
            <button type="submit" class="btn-save">Lưu Danh Mục</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script>
import { supabase } from '../supabaseClient' // Đường dẫn tùy project của bạn
import * as XLSX from 'xlsx'

export default {
  data() {
    return {
      categories: [],
      searchQuery: '',
      filterParent: '',
      filterStatus: '', // true, false, or ''
      currentPage: 1,
      pageSize: 10,
      
      // Form Data
      showForm: false,
      editingCategory: null,
      form: {
        name: '',
        slug: '',
        parent_id: null,
        icon: '',
        is_active: true
      }
    }
  },
  
  async mounted() {
    await this.loadCategories();
  },

  computed: {
    // List danh mục có thể làm cha (loại bỏ chính nó nếu đang edit)
    availableParents() {
        if (!this.editingCategory) return this.categories;
        return this.categories.filter(c => c.id !== this.editingCategory.id);
    },
    // Danh sách gốc để filter
    rootCategories() {
        return this.categories.filter(c => !c.parent_id);
    },

    // Logic lọc hiển thị
    filteredCategories() {
      return this.categories.filter(c => {
        const query = this.searchQuery.toLowerCase();
        const matchesSearch = c.name && c.name.toLowerCase().includes(query) || 
                              c.slug && c.slug.toLowerCase().includes(query);
        
        let matchesStatus = true;
        if (this.filterStatus !== '') {
            matchesStatus = c.is_active === this.filterStatus;
        }

        let matchesParent = true;
        if (this.filterParent === 'root') {
            matchesParent = !c.parent_id;
        } else if (this.filterParent) {
            matchesParent = c.parent_id === this.filterParent;
        }

        return matchesSearch && matchesStatus && matchesParent;
      })
    },

    paginatedCategories() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredCategories.slice(start, start + this.pageSize);
    },
    totalPages() { return Math.ceil(this.filteredCategories.length / this.pageSize) || 1; },
    
    // Stats logic
    rootCategoriesCount() { return this.categories.filter(c => !c.parent_id).length; },
    activeCount() { return this.categories.filter(c => c.is_active).length; },
    inactiveCount() { return this.categories.filter(c => !c.is_active).length; }
  },

  watch: {
    'form.name': function(newVal) {
        // Tự động tạo slug khi nhập tên (chỉ khi tạo mới)
        if (!this.editingCategory && newVal) {
            this.form.slug = this.toSlug(newVal);
        }
    }
  },

  methods: {
    // --- LOAD DATA ---
    async loadCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) console.error('Lỗi load danh mục:', error);
      else this.categories = data || [];
    },

    getParentName(parentId) {
        if (!parentId) return '';
        const parent = this.categories.find(c => c.id === parentId);
        return parent ? parent.name : 'Unknown';
    },

    // --- UTILS ---
    toSlug(str) {
        return str.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/([^0-9a-z-\s])/g, "")
            .replace(/(\s+)/g, "-")
            .replace(/^-+|-+$/g, "");
    },

    // --- FORM LOGIC ---
    openForm(category = null) {
      this.editingCategory = category;
      if (category) {
        this.form = { ...category };
      } else {
        this.form = {
          name: '',
          slug: '',
          parent_id: null,
          icon: '',
          is_active: true
        };
      }
      this.showForm = true;
    },

    async saveCategory() {
      try {
        const payload = {
            name: this.form.name,
            slug: this.form.slug,
            parent_id: this.form.parent_id,
            icon: this.form.icon,
            is_active: this.form.is_active
        };

        if (this.editingCategory) {
            const { error } = await supabase.from('categories').update(payload).eq('id', this.editingCategory.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('categories').insert(payload);
            if (error) throw error;
        }

        alert('Lưu danh mục thành công!');
        this.showForm = false;
        await this.loadCategories();

      } catch (err) {
        console.error("Lỗi Save:", err);
        alert('Có lỗi xảy ra: ' + err.message);
      }
    },

    async deleteCategory(id) {
        // Kiểm tra xem có danh mục con không
        const hasChildren = this.categories.some(c => c.parent_id === id);
        if (hasChildren) {
            alert("Không thể xóa danh mục này vì nó đang chứa các danh mục con.");
            return;
        }

        if(confirm("Bạn có chắc muốn xóa danh mục này?")) {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) {
                alert("Lỗi khi xóa: " + error.message);
            } else {
                this.loadCategories();
            }
        }
    },

    // --- EXCEL ---
    exportToExcel() {
      if (this.categories.length === 0) return alert("Không có dữ liệu để xuất");
      const data = this.categories.map(c => ({
          'Tên': c.name,
          'Slug': c.slug,
          'Danh mục cha': this.getParentName(c.parent_id) || 'Gốc',
          'Trạng thái': c.is_active ? 'Hoạt động' : 'Ẩn'
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Categories");
      XLSX.writeFile(wb, "Danh_Sach_DanhMuc.xlsx");
    }
  }
}
</script>

<style scoped>
/* =========================================
   COPY TOÀN BỘ STYLE TỪ TRANG PRODUCT 
   (Đã được giữ nguyên 100% bên dưới, chỉ chỉnh modal nhỏ hơn chút)
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
.filter-actions { display: flex; gap: 12px; }
.filter-select { padding: 10px 30px 10px 15px; border: 1px solid #e5e7eb; border-radius: 0.2rem; background: white; outline: none; cursor: pointer; font-size: 14px; }

/* TABLE */
.table-card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow-x: auto; margin-bottom: 24px; }
.product-table { width: 100%; border-collapse: collapse; min-width: 900px; }
.product-table th { background: #f9fafb; padding: 14px 20px; text-align: center; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
.product-table td { padding: 14px 20px; vertical-align: middle; font-size: 14px; color: #374151; }
.product-table tr { border-bottom: 1px solid #f3f4f6; }
.product-table tr:hover { background: #f7f7f7; }

/* Cells & Badges */
.product-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 1px solid #e5e7eb; flex-shrink: 0; }
.product-img { width: 100%; height: 100%; object-fit: cover; }
.product-avatar .mono-avatar { width: 100%; height: 100%; background: #f3f4f6; color: #000; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; }
.product-name-text { font-weight: 600; color: #111827; }
.sku-tag { padding: 4px 8px; border-radius: 0.2rem; font-size: 12px; background: #f3f4f6; color: #666; }
.category-tag { background: #f3f4f6; color: #4b5563; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; border: 1px solid #e5e7eb; }

.stock-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.stock-badge.in-stock { background: #ecfdf5; color: #059669; }
.stock-badge.out-stock { background: #fef2f2; color: #dc2626; }

.actions { display: flex; justify-content: center; gap: 6px; }
.action-btn { width: 40px; height: 40px; border-radius: 50%; background: white; color: #6b7280; display: grid; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; border: none; }
.action-btn:hover { color: #000; background: rgb(240, 239, 239) }
.action-btn svg { width: 16px; height: 16px; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.text-muted { color: #9ca3af; }

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
.form-grid.single-col { display: grid; grid-template-columns: 1fr; gap: 15px; } /* Override 1 cột cho danh mục */
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; text-align: justify; }
.required { color: red; }
.form-input, .form-select { padding: 10px; border: 1px solid #e9eaeb; border-radius: 0.2rem; font-size: 14px; outline: none; width: 100%; }
.form-input:focus { border-color: #000; }

/* Checkbox */
.checkbox-container { display: flex; align-items: center; position: relative; padding-left: 30px; cursor: pointer; font-size: 14px; user-select: none; }
.checkbox-container input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
.checkmark { position: absolute; top: 0; left: 0; height: 20px; width: 20px; background-color: #eee; border-radius: 4px; }
.checkbox-container:hover input ~ .checkmark { background-color: #ccc; }
.checkbox-container input:checked ~ .checkmark { background-color: #000; }
.checkmark:after { content: ""; position: absolute; display: none; }
.checkbox-container input:checked ~ .checkmark:after { display: block; }
.checkbox-container .checkmark:after { left: 7px; top: 3px; width: 5px; height: 10px; border: solid white; border-width: 0 3px 3px 0; transform: rotate(45deg); }

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