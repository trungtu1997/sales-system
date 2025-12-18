<template>
  <div class="products-page">
    <div class="page-header">
      <h1 class="page-title">Quản Lý Sản Phẩm</h1>
      <div class="page-actions">
        <input v-model="searchQuery" placeholder="Tìm theo tên hoặc slug" class="search-input" />
        <button @click="openForm()" class="btn-add">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
          Thêm Sản Phẩm
        </button>
      </div>
    </div>

    <!-- Loading spinner -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Đang tải sản phẩm...</p>
    </div>

    <!-- List sản phẩm -->
    <div class="product-list">
      <div class="product-card" v-for="(product, index) in paginatedProducts" :key="product.id">
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="slug">Slug: {{ product.slug }}</p>
          <p>Danh mục: {{ product.category_id }} | Thương hiệu: {{ product.brand_id }}</p>
          <p class="status" :class="product.status">{{ product.status }}</p>
        </div>
        <div class="product-actions">
          <button @click="openForm(product)" class="btn-edit">Sửa</button>
          <button v-if="role === 'admin'" @click="deleteProduct(product.id)" class="btn-delete">Xóa</button>
        </div>
      </div>

      <div v-if="paginatedProducts.length === 0" class="no-data">
        <p>Không tìm thấy sản phẩm nào.</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button @click="currentPage--" :disabled="currentPage === 1" class="btn-page">Trước</button>
      <span class="page-info">Trang {{ currentPage }} / {{ totalPages }}</span>
      <button @click="currentPage++" :disabled="currentPage === totalPages" class="btn-page">Sau</button>
    </div>

    <!-- Modal form -->
    <div v-if="showForm" class="modal-overlay" @click="showForm = false">
      <div class="modal-card" @click.stop>
        <h2>{{ editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới' }}</h2>
        <form @submit.prevent="saveProduct" class="product-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Tên sản phẩm</label>
              <input v-model="form.name" required />
            </div>
            <div class="form-group">
              <label>Slug</label>
              <input v-model="form.slug" required />
            </div>
            <div class="form-group">
              <label>ID Danh mục</label>
              <input v-model="form.category_id" required />
            </div>
            <div class="form-group">
              <label>ID Thương hiệu</label>
              <input v-model="form.brand_id" required />
            </div>
            <div class="form-group full-width">
              <label>Mô tả</label>
              <textarea v-model="form.description"></textarea>
            </div>
            <div class="form-group full-width">
              <label>Nội dung chi tiết (HTML)</label>
              <textarea v-model="form.content"></textarea>
            </div>
            <div class="form-group">
              <label>Đơn vị cơ bản</label>
              <input v-model="form.base_unit" required />
            </div>
            <div class="form-group">
              <label>Trạng thái</label>
              <select v-model="form.status">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div class="form-group">
              <label>Loại sản phẩm</label>
              <select v-model="form.product_type">
                <option value="goods">Goods</option>
                <option value="material">Material</option>
                <option value="service">Service</option>
              </select>
            </div>
            <div class="form-group checkbox">
              <label>
                <input type="checkbox" v-model="form.is_for_sale" />
                Có bán
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-save">Lưu</button>
            <button type="button" @click="showForm = false" class="btn-cancel">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../supabaseClient'

export default {
  data() {
    return {
      products: [],
      searchQuery: '',
      currentPage: 1,
      pageSize: 10,
      showForm: false,
      editingProduct: null,
      loading: false,
      form: {
        name: '',
        slug: '',
        category_id: '',
        brand_id: '',
        description: '',
        content: '',
        base_unit: '',
        status: 'draft',
        product_type: 'goods',
        is_for_sale: true
      },
      role: 'staff'
    }
  },
  async mounted() {
    this.loading = true
    await this.loadProducts()
    await this.loadData()
    this.loading = false
  },
  computed: {
    filteredProducts() {
      return this.products.filter(p => 
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        p.slug.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredProducts.slice(start, start + this.pageSize)
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.pageSize) || 1
    }
  },
  methods: {
    async loadProducts() {
      const { data, error } = await supabase.from('products').select('*')
      if (error) console.error(error)
      else this.products = data || []
    },
    async loadRole() {
      if (!this.$root.user) return
      const { data } = await supabase.from('profiles').select('role').eq('id', this.$root.user.id).single()
      this.role = data?.role || 'staff'
    },
    openForm(product = null) {
      this.editingProduct = product
      this.form = product ? { ...product } : {
        name: '',
        slug: '',
        category_id: '',
        brand_id: '',
        description: '',
        content: '',
        base_unit: '',
        status: 'draft',
        product_type: 'goods',
        is_for_sale: true
      }
      this.showForm = true
    },
    async saveProduct() {
      let error
      if (this.editingProduct) {
        ({ error } = await supabase.from('products').update(this.form).eq('id', this.editingProduct.id))
      } else {
        ({ error } = await supabase.from('products').insert(this.form))
      }
      if (error) console.error(error)
      else {
        this.showForm = false
        this.loadProducts()
      }
    },
    async deleteProduct(id) {
      if (confirm('Xóa sản phẩm này?')) {
        const { error } = await supabase.from('products').delete().eq('id', id)
        if (error) console.error(error)
        else this.loadProducts()
      }
    }
  }
}
</script>

<style scoped>
.products-page {
  padding: 30px;
  background: #f9fafb;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
}

.page-actions {
  display: flex;
  gap: 15px;
  flex: 1;
  max-width: 600px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-add svg {
  width: 20px;
}

.loading {
  text-align: center;
  padding: 50px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: 0.3s;
}

.product-card:hover {
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  transform: translateY(-4px);
}

.product-info h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #1f2937;
}

.slug {
  color: #6b7280;
  font-size: 14px;
  margin: 8px 0;
}

.status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status.draft {
  background: #fef3c7;
  color: #92400e;
}

.status.active {
  background: #d1fae5;
  color: #065f46;
}

.status.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.product-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.btn-edit {
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
}

.btn-delete {
  background: #ef4444;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
}

.no-data {
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px;
  color: #9ca3af;
}

.pagination {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.btn-page {
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 8px;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #374151;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: white;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  padding: 30px;
}

.modal-card h2 {
  margin-bottom: 25px;
  text-align: center;
  font-size: 24px;
  color: #1f2937;
}

.product-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
}

.full-width {
  grid-column: span 2;
}

.form-actions {
  grid-column: span 2;
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.btn-save {
  padding: 14px 32px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
}

.btn-cancel {
  padding: 14px 32px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

/* Responsive mobile */
@media (max-width: 768px) {
  .product-list {
    grid-template-columns: 1fr;
  }
  .product-form {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  .page-actions {
    flex-direction: column;
  }
}
</style>