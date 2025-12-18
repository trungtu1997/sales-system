<template>
  <div class="products-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Quản Lý Sản Phẩm</h1>
        <ul class="breadcrumb">
          <li><span class="icon">🏠</span> Trang chủ</li>
          <li class="separator">/</li>
          <li class="active">Sản phẩm</li>
        </ul>
      </div>
      <div class="header-actions">
        <button class="btn btn-white">
          <span class="icon">📂</span> Tạo danh mục
        </button>
        <button @click="openForm()" class="btn btn-primary">
          <span class="icon">➕</span> Thêm sản phẩm
        </button>
        <button class="btn btn-white">
          <span class="icon">📊</span> Xuất Excel
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper bg-purple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Tổng sản phẩm</span>
          <h3 class="stat-value">{{ products.length }}</h3>
          <span class="stat-sub">Sản phẩm trong kho</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper bg-green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Còn hàng</span>
          <h3 class="stat-value">{{ inStockCount }}</h3>
          <span class="stat-sub">Sản phẩm có sẵn</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper bg-orange">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Hết hàng</span>
          <h3 class="stat-value">{{ outOfStockCount }}</h3>
          <span class="stat-sub">Cần nhập thêm</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper bg-blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Danh mục</span>
          <h3 class="stat-value">{{ categories.length }}</h3>
          <span class="stat-sub">Nhóm hàng</span>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          v-model="searchQuery" 
          placeholder="Tìm kiếm theo tên, SKU..." 
          class="search-input" 
        />
      </div>
      <div class="filter-actions">
        <select class="filter-select" v-model="filterCategory">
          <option value="">Tất cả danh mục</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
        <select class="filter-select" v-model="filterStatus">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang bán</option>
          <option value="draft">Nháp</option>
          <option value="inactive">Ngừng bán</option>
        </select>
      </div>
    </div>

    <div class="table-card">
      <table class="product-table">
        <thead>
          <tr>
            <th width="40"><input type="checkbox" /></th>
            <th>SKU</th>
            <th>SẢN PHẨM</th>
            <th>DANH MỤC</th>
            <th>ĐƠN VỊ</th>
            <th>TỒN KHO</th>
            <th v-if="role === 'admin'">GIÁ NHẬP</th>
            <th>GIÁ BÁN</th>
            <th>GIÁ SỈ</th>
            <th class="text-right">HÀNH ĐỘNG</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedProducts.length === 0">
            <td colspan="10" class="text-center empty-state">Không tìm thấy sản phẩm nào</td>
          </tr>
          <tr v-for="product in paginatedProducts" :key="product.id">
            <td><input type="checkbox" /></td>
            <td>
               <span class="sku-tag">{{ product.sku || ('SP' + product.id) }}</span>
            </td>
            <td>
              <div class="product-info-cell">
                <div class="product-avatar" :class="getAvatarColor(product.id)">
                   {{ product.name ? product.name.charAt(0).toUpperCase() : 'P' }}
                </div>
                <div class="product-details">
                    <span class="product-name-text">{{ product.name }}</span>
                    <span class="product-slug-text">/{{ product.slug }}</span>
                </div>
              </div>
            </td>
            <td>
                <span class="category-tag">{{ getCategoryName(product.category_id) }}</span>
            </td>
            <td>{{ product.base_unit }}</td>
            <td>
              <span class="stock-badge" :class="getStockClass(product.total_stock)">
                {{ product.total_stock || 0 }}
              </span>
            </td>
            <td v-if="role === 'admin'">{{ formatPrice(product.cost_price) }}</td>
            <td class="font-bold text-primary">{{ formatPrice(product.retail_price) }}</td>
            <td class="text-secondary">{{ formatPrice(product.wholesale_price) }}</td>
            <td class="actions text-right">
              <button class="action-btn view" @click="openView(product)" title="Xem chi tiết">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
              <button class="action-btn edit" @click="openForm(product)" title="Chỉnh sửa">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button v-if="role === 'admin'" class="action-btn delete" @click="deleteProduct(product.id)" title="Xóa">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-wrapper">
      <div class="pagination-info">
        Hiển thị <strong>{{ (currentPage - 1) * pageSize + 1 }}</strong> - <strong>{{ Math.min(currentPage * pageSize, filteredProducts.length) }}</strong> của <strong>{{ filteredProducts.length }}</strong> sản phẩm
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
      <div class="modal-card" @click.stop>
        <div class="modal-header">
           <h2>{{ editingProduct ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới' }}</h2>
           <button class="btn-close-modal" @click="showForm = false">&times;</button>
        </div>
        
        <form @submit.prevent="saveProduct" class="product-form">
          <div class="form-scrollable-content">
              <div class="form-section-title">Thông tin chung</div>
              <div class="form-grid">
                <div class="form-group">
                  <label>Tên sản phẩm <span class="required">*</span></label>
                  <input v-model="form.name" required class="form-input" placeholder="Nhập tên sản phẩm..." />
                </div>
                <div class="form-group">
                  <label>Slug (URL) <span class="required">*</span></label>
                  <input v-model="form.slug" required class="form-input" placeholder="ten-san-pham" />
                </div>
                <div class="form-group">
                  <label>Danh mục</label>
                  <select v-model="form.category_id" required class="form-select">
                    <option value="">-- Chọn danh mục --</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Thương hiệu</label>
                  <select v-model="form.brand_id" class="form-select">
                    <option value="">-- Chọn thương hiệu --</option>
                    <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
                  </select>
                </div>
                <div class="form-group full-width">
                  <label>Mô tả ngắn</label>
                  <textarea v-model="form.description" class="form-textarea" rows="2" placeholder="Mô tả sơ lược về sản phẩm..."></textarea>
                </div>
                <div class="form-group full-width">
                  <label>Nội dung chi tiết (HTML)</label>
                  <textarea v-model="form.content" class="form-textarea" rows="4" placeholder="Nội dung chi tiết..."></textarea>
                </div>
                <div class="form-group">
                  <label>Đơn vị tính</label>
                  <input v-model="form.base_unit" required class="form-input" placeholder="Cái, Hộp, Kg..." />
                </div>
                <div class="form-group">
                  <label>Trạng thái</label>
                  <select v-model="form.status" class="form-select">
                    <option value="draft">Nháp</option>
                    <option value="active">Đang bán</option>
                    <option value="inactive">Ngừng bán</option>
                  </select>
                </div>
                <div class="form-group checkbox-group">
                  <label class="checkbox-container">
                    <input type="checkbox" v-model="form.is_for_sale" />
                    <span class="checkmark"></span>
                    Cho phép bán
                  </label>
                </div>
              </div>

              <div class="variants-section">
                <div class="section-header">
                    <div class="section-title-group">
                        <div class="form-section-title">Biến Thể & Giá</div>
                        <p class="section-desc">Quản lý SKU, giá và tồn kho cho từng biến thể</p>
                    </div>
                    <button type="button" @click="addVariant" class="btn-add-variant">
                        <span>+</span> Thêm biến thể
                    </button>
                </div>
                
                <div v-if="form.variants.length === 0" class="empty-variants">
                    Chưa có biến thể nào. Hãy thêm biến thể để thiết lập giá và tồn kho.
                </div>

                <div v-for="(variant, index) in form.variants" :key="index" class="variant-card">
                   <div class="variant-header">
                       <h5 class="variant-title">Biến thể #{{ index + 1 }}</h5>
                       <button type="button" @click="removeVariant(index)" class="btn-remove-variant">
                           Xóa
                       </button>
                   </div>
                   
                   <div class="variant-grid">
                      <div class="input-group">
                        <label>Mã SKU <span class="required">*</span></label>
                        <input v-model="variant.sku" placeholder="Mã SKU" required class="form-input" />
                      </div>
                      <div class="input-group">
                        <label>Tên biến thể</label>
                        <input v-model="variant.variant_name" placeholder="VD: Đỏ - Size M" class="form-input" />
                      </div>
                      <div class="input-group">
                        <label>Số lượng tồn</label>
                        <input v-model.number="variant.quantity" type="number" placeholder="0" class="form-input" />
                      </div>
                      <div class="input-group">
                        <label>Giá bán lẻ</label>
                        <input v-model.number="variant.retail_price" type="number" placeholder="0" class="form-input" />
                      </div>
                      <div class="input-group">
                        <label>Giá vốn</label>
                        <input v-model.number="variant.cost_price" type="number" placeholder="0" class="form-input" />
                      </div>
                      <div class="input-group">
                        <label>Giá sỉ</label>
                        <input v-model.number="variant.wholesale_price" type="number" placeholder="0" class="form-input" />
                      </div>
                   </div>
                   
                   <div class="attributes-container">
                      <label class="attr-label">Thuộc tính:</label>
                      <div class="attr-list">
                          <div v-for="(attr, attrIndex) in variant.attributes" :key="attrIndex" class="attr-row">
                            <input v-model="attr.attribute_name" placeholder="Tên (Màu)" class="form-input small" />
                            <input v-model="attr.attribute_value" placeholder="Giá trị (Xanh)" class="form-input small" />
                          </div>
                          <button type="button" @click="addAttribute(index)" class="btn-small-dashed">+ Thêm TT</button>
                      </div>
                   </div>
                </div>
              </div>
          </div>

          <div class="form-footer">
            <button type="button" @click="showForm = false" class="btn-cancel">Hủy bỏ</button>
            <button type="submit" class="btn-save">Lưu Sản Phẩm</button>
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
      categories: [],
      brands: [],
      searchQuery: '',
      filterCategory: '',
      filterStatus: '',
      currentPage: 1,
      pageSize: 10,
      showForm: false,
      editingProduct: null,
      // Form mặc định đầy đủ các trường
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
        is_for_sale: true,
        variants: []
      },
      role: 'staff'
    }
  },
  
  async mounted() {
    // Load đồng thời tất cả dữ liệu cần thiết khi vào trang
    await Promise.all([
      this.loadProducts(),
      this.loadCategories(),
      this.loadBrands(),
      this.loadRole()
    ])
  },

  computed: {
    // Logic lọc sản phẩm theo search, danh mục, trạng thái
    filteredProducts() {
      return this.products.filter(p => {
        const query = this.searchQuery.toLowerCase();
        const matchesSearch = 
            (p.name && p.name.toLowerCase().includes(query)) || 
            (p.slug && p.slug.toLowerCase().includes(query)) ||
            (p.sku && p.sku.toLowerCase().includes(query));
            
        const matchesCategory = !this.filterCategory || p.category_id === this.filterCategory;
        const matchesStatus = !this.filterStatus || p.status === this.filterStatus;
        
        return matchesSearch && matchesCategory && matchesStatus;
      })
    },
    // Logic phân trang
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredProducts.slice(start, start + this.pageSize);
    },
    // Tổng số trang
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.pageSize) || 1;
    },
    // Đếm số lượng tồn kho/hết hàng để hiển thị lên Stats Card
    inStockCount() {
      return this.products.filter(p => (p.total_stock || 0) > 0).length;
    },
    outOfStockCount() {
      return this.products.filter(p => (p.total_stock || 0) === 0).length;
    }
  },

  methods: {
    // ---------------------------------------------------------
    // 1. CÁC HÀM LOAD DỮ LIỆU TỪ SUPABASE
    // ---------------------------------------------------------
    async loadProducts() {
      // Select * để lấy các cột total_stock, retail_price đã thêm
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false }); // Sắp xếp mới nhất lên đầu

      if (error) {
        console.error('Lỗi load sản phẩm:', error);
      } else {
        this.products = data || [];
      }
    },

    async loadCategories() {
      const { data, error } = await supabase.from('categories').select('id, name');
      if (!error) this.categories = data || [];
    },

    async loadBrands() {
      const { data, error } = await supabase.from('brands').select('id, name');
      if (!error) this.brands = data || [];
    },

    async loadRole() {
      if (!this.$root.user) return;
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', this.$root.user.id)
        .single();
      this.role = data?.role || 'staff';
    },

    // ---------------------------------------------------------
    // 2. CÁC HÀM XỬ LÝ FORM (MỞ/ĐÓNG/RESET)
    // ---------------------------------------------------------
    async openForm(product = null) {
      this.editingProduct = product;
      
      if (product) {
        // Nếu là Sửa: Cần load variants của sản phẩm đó từ bảng con
        const variants = await this.fetchVariantsForProduct(product.id);
        
        // Clone object để không sửa trực tiếp vào list khi chưa save
        this.form = { 
            ...product, 
            variants: variants || [] 
        };
        this.showForm = true;
      } else {
        // Nếu là Thêm Mới: Reset form về trắng
        this.form = {
          name: '', slug: '', category_id: '', brand_id: '', description: '',
          content: '', base_unit: '', status: 'draft', product_type: 'goods',
          is_for_sale: true, variants: []
        };
        // Tự động thêm 1 dòng variant trống cho tiện nhập
        this.addVariant();
        this.showForm = true;
      }
    },

    async fetchVariantsForProduct(productId) {
        const { data, error } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', productId)
            .order('id', { ascending: true });
            
        if(error) {
            console.error("Lỗi load biến thể:", error);
            return [];
        }
        
        // Load thêm attributes cho từng variant (nếu cần thiết)
        // Ở mức cơ bản, nếu bạn chưa lưu attributes vào bảng riêng, có thể bỏ qua
        return data; 
    },

    // ---------------------------------------------------------
    // 3. CÁC HÀM THAO TÁC BIẾN THỂ (VARIANTS)
    // ---------------------------------------------------------
    addVariant() {
      this.form.variants.push({
        sku: '', 
        variant_name: '', 
        quantity: 0, 
        cost_price: 0, 
        retail_price: 0, 
        wholesale_price: 0, 
        stock_alert: 5, 
        attributes: []
      });
    },

    addAttribute(variantIndex) {
      if(!this.form.variants[variantIndex].attributes) {
          this.form.variants[variantIndex].attributes = [];
      }
      this.form.variants[variantIndex].attributes.push({ 
          attribute_name: '', 
          attribute_value: '' 
      });
    },

    removeVariant(index) {
      this.form.variants.splice(index, 1);
    },

    // ---------------------------------------------------------
    // 4. HÀM LƯU SẢN PHẨM (QUAN TRỌNG NHẤT)
    // ---------------------------------------------------------
    async saveProduct() {
      let productId;
      try {
        // BƯỚC A: TÍNH TOÁN DỮ LIỆU TỔNG HỢP
        let calculatedStock = 0;
        let mainRetailPrice = 0;
        let mainCostPrice = 0;
        let mainWholesalePrice = 0;

        if (this.form.variants && this.form.variants.length > 0) {
            // Tổng tồn kho = tổng quantity các biến thể
            calculatedStock = this.form.variants.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0);
            
            // Giá hiển thị = giá của biến thể đầu tiên
            const firstVar = this.form.variants[0];
            mainRetailPrice = Number(firstVar.retail_price) || 0;
            mainCostPrice = Number(firstVar.cost_price) || 0;
            mainWholesalePrice = Number(firstVar.wholesale_price) || 0;
        }

        // BƯỚC B: CHUẨN BỊ PAYLOAD BẢNG CHA
        const payload = {
            name: this.form.name,
            slug: this.form.slug,
            category_id: this.form.category_id,
            brand_id: this.form.brand_id,
            description: this.form.description,
            content: this.form.content,
            base_unit: this.form.base_unit,
            status: this.form.status,
            product_type: this.form.product_type,
            is_for_sale: this.form.is_for_sale,
            
            // Cập nhật các cột tổng hợp
            total_stock: calculatedStock,
            retail_price: mainRetailPrice,
            cost_price: mainCostPrice,
            wholesale_price: mainWholesalePrice
        };

        // BƯỚC C: INSERT HOẶC UPDATE BẢNG CHA
        if (this.editingProduct) {
          const { error } = await supabase
            .from('products')
            .update(payload)
            .eq('id', this.editingProduct.id);
          if (error) throw error;
          productId = this.editingProduct.id;
        } else {
          const { data, error } = await supabase
            .from('products')
            .insert(payload)
            .select('id')
            .single();
          if (error) throw error;
          productId = data.id;
        }

        // BƯỚC D: LƯU BIẾN THỂ (Xóa hết cũ -> Thêm mới để tránh lỗi đồng bộ)
        if (this.form.variants && this.form.variants.length > 0) {
          // 1. Xóa biến thể cũ
          await supabase.from('product_variants').delete().eq('product_id', productId);

          // 2. Thêm biến thể mới
          for (const variant of this.form.variants) {
             const variantPayload = {
              product_id: productId,
              sku: variant.sku,
              barcode: variant.barcode,
              variant_name: variant.variant_name,
              quantity: Number(variant.quantity) || 0,
              cost_price: Number(variant.cost_price) || 0,
              retail_price: Number(variant.retail_price) || 0,
              wholesale_price: Number(variant.wholesale_price) || 0,
              stock_alert: Number(variant.stock_alert) || 5
            };
            
            // Insert từng dòng
            const { data: vData, error: vError } = await supabase
                .from('product_variants')
                .insert(variantPayload)
                .select('id')
                .single();
                
            if (vError) throw vError;

            // 3. (Tuỳ chọn) Lưu thuộc tính nếu có
            if (variant.attributes && variant.attributes.length > 0) {
                 // Code lưu attributes (cần bảng variant_attributes)
                 // Nếu chưa có bảng này thì bỏ qua
            }
          }
        }

        // BƯỚC E: HOÀN TẤT
        alert('Lưu sản phẩm thành công!');
        this.showForm = false;
        await this.loadProducts(); // Load lại danh sách để thấy số lượng mới
        
      } catch (err) {
        console.error('Lỗi lưu sản phẩm:', err);
        alert('Lỗi: ' + (err.message || 'Không thể lưu sản phẩm'));
      }
    },

    // ---------------------------------------------------------
    // 5. CÁC HÀM TIỆN ÍCH KHÁC (DELETE, VIEW, FORMAT)
    // ---------------------------------------------------------
    async deleteProduct(id) {
        if(confirm("Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.")) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) {
                alert("Lỗi xóa: " + error.message);
            } else {
                await this.loadProducts();
            }
        }
    },

    openView(product) {
      alert(`Đang xem chi tiết sản phẩm: ${product.name}\nTổng tồn kho: ${product.total_stock}`);
    },

    // Helper: Class màu sắc cho tồn kho
    getStockClass(stock) {
      if (!stock || stock === 0) return 'out-stock';
      if (stock <= 10) return 'low-stock';
      return 'in-stock';
    },

    // Helper: Định dạng tiền tệ VND
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    },

    // Helper: Lấy tên danh mục từ ID
    getCategoryName(id) {
      const cat = this.categories.find(c => c.id === id);
      return cat ? cat.name : '—';
    },

    // Helper: Tạo màu ngẫu nhiên cho avatar
    getAvatarColor(id) {
        const colors = ['bg-avatar-purple', 'bg-avatar-blue', 'bg-avatar-green', 'bg-avatar-orange'];
        return colors[(id || 0) % colors.length] || 'bg-avatar-purple';
    }
  }
}
</script>

<style scoped>
/* =========================================
   1. GLOBAL LAYOUT & TYPOGRAPHY
   ========================================= */
.products-page {
  padding: 32px 40px;
  background-color: #f8f9fa; /* Nền xám rất nhạt */
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1f2937;
}

/* =========================================
   2. HEADER & BREADCRUMB
   ========================================= */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.breadcrumb {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.breadcrumb .separator { margin: 0 8px; color: #d1d5db; }
.breadcrumb .active { color: #374151; font-weight: 500; }
.breadcrumb .icon { margin-right: 4px; font-size: 14px; }

.header-actions { display: flex; gap: 12px; }

/* BUTTON STYLES */
.btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn .icon { font-size: 16px; font-weight: normal; }

.btn-primary {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
}
.btn-primary:hover {
  background: #4f46e5;
  transform: translateY(-1px);
}

.btn-white {
  background: white;
  border-color: #e5e7eb;
  color: #374151;
}
.btn-white:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

/* =========================================
   3. STATS CARDS
   ========================================= */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0,0,0,0.02);
  transition: transform 0.2s;
}
.stat-card:hover { transform: translateY(-2px); }

.stat-icon-wrapper {
  width: 56px; height: 56px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.stat-icon-wrapper svg { width: 28px; height: 28px; }

/* Color Themes */
.bg-purple { background: #e0e7ff; color: #6366f1; }
.bg-green { background: #d1fae5; color: #10b981; }
.bg-orange { background: #ffedd5; color: #f59e0b; }
.bg-blue { background: #dbeafe; color: #3b82f6; }

.stat-content { display: flex; flex-direction: column; }
.stat-label { color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.stat-value { font-size: 28px; font-weight: 800; color: #111827; margin: 0; line-height: 1.2; }
.stat-sub { color: #9ca3af; font-size: 12px; margin-top: 2px; }

/* =========================================
   4. FILTER BAR
   ========================================= */
.filter-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 20px;
}

.search-wrapper { position: relative; flex: 1; max-width: 400px; }
.search-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  width: 18px; color: #9ca3af;
}
.search-input {
  width: 100%; padding: 12px 12px 12px 42px;
  border: 1px solid #e5e7eb; border-radius: 12px;
  background: white; outline: none; transition: all 0.2s;
  font-size: 14px;
}
.search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}

.filter-actions { display: flex; gap: 12px; }
.filter-select {
  padding: 10px 36px 10px 16px;
  border: 1px solid #e5e7eb; border-radius: 12px;
  background: white url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 0.5rem center/1.5em 1.5em;
  color: #374151; outline: none; cursor: pointer;
  font-size: 14px; min-width: 180px; appearance: none;
}

/* =========================================
   5. DATA TABLE
   ========================================= */
.table-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 24px;
  border: 1px solid #f3f4f6;
}

.product-table { width: 100%; border-collapse: collapse; }

.product-table th {
  background: #f9fafb;
  padding: 16px 24px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
  letter-spacing: 0.5px;
}

.product-table td {
  padding: 16px 24px;
  vertical-align: middle;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #374151;
}

.product-table tr:hover { background-color: #f9fafb; }
.empty-state { padding: 40px; color: #9ca3af; font-style: italic; }

/* Table Columns Styling */
.text-right { text-align: right; }
.text-center { text-align: center; }
.font-bold { font-weight: 600; }
.text-primary { color: #6366f1; }
.text-secondary { color: #6b7280; font-size: 13px; }

.sku-tag {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
  color: #4b5563;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
}

.category-tag {
    background: #eff6ff;
    color: #3b82f6;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}

/* Product Info Cell (Avatar + Name) */
.product-info-cell { display: flex; align-items: center; gap: 16px; }

.product-avatar {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 18px; color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.bg-avatar-purple { background: linear-gradient(135deg, #6366f1, #818cf8); }
.bg-avatar-blue { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
.bg-avatar-green { background: linear-gradient(135deg, #10b981, #34d399); }
.bg-avatar-orange { background: linear-gradient(135deg, #f59e0b, #fbbf24); }

.product-details { display: flex; flex-direction: column; }
.product-name-text { font-weight: 600; color: #111827; font-size: 15px; }
.product-slug-text { color: #9ca3af; font-size: 12px; }

/* Stock Badges */
.stock-badge {
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
  min-width: 40px; text-align: center;
}
.stock-badge.in-stock { background: #ecfdf5; color: #059669; }
.stock-badge.low-stock { background: #fffbeb; color: #d97706; }
.stock-badge.out-stock { background: #fef2f2; color: #dc2626; }

/* Action Buttons */
.actions { display: flex; justify-content: flex-end; gap: 8px; }
.action-btn {
  width: 36px; height: 36px;
  border-radius: 10px;
  border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn svg { width: 18px; height: 18px; }

.action-btn.view { background: #eff6ff; color: #3b82f6; }
.action-btn.view:hover { background: #dbeafe; transform: scale(1.05); }

.action-btn.edit { background: #f0fdf4; color: #16a34a; }
.action-btn.edit:hover { background: #dcfce7; transform: scale(1.05); }

.action-btn.delete { background: #fef2f2; color: #dc2626; }
.action-btn.delete:hover { background: #fee2e2; transform: scale(1.05); }

/* =========================================
   6. PAGINATION
   ========================================= */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
}
.pagination-info { color: #6b7280; font-size: 14px; }
.pagination-info strong { color: #111827; font-weight: 600; }

.pagination-controls { display: flex; gap: 8px; align-items: center; }

.btn-page-nav {
  width: 36px; height: 36px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  color: #6b7280;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.btn-page-nav:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
.btn-page-nav:disabled { opacity: 0.5; cursor: not-allowed; background: #f9fafb; }

.page-numbers { display: flex; gap: 4px; }
.page-number {
  width: 36px; height: 36px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #374151;
  font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.page-number.active { background: #6366f1; color: white; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3); }

/* =========================================
   7. MODAL FORM STYLES
   ========================================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.modal-card {
  background: white;
  width: 900px;
  max-width: 95vw;
  max-height: 90vh;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}
.modal-header h2 { margin: 0; font-size: 20px; color: #111827; font-weight: 700; }
.btn-close-modal {
    background: none; border: none; font-size: 28px; cursor: pointer; color: #9ca3af; line-height: 1;
}
.btn-close-modal:hover { color: #ef4444; }

/* Scrollable Form Area */
.product-form {
    display: flex; flex-direction: column; height: 100%; overflow: hidden;
}

.form-scrollable-content {
    flex: 1;
    overflow-y: auto;
    padding: 32px;
}

/* Form Sections */
.form-section-title {
    font-size: 16px; font-weight: 700; color: #374151; margin-bottom: 16px; border-left: 4px solid #6366f1; padding-left: 10px;
}

.form-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;
}
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group.full-width { grid-column: span 2; }
.form-group label { font-size: 14px; font-weight: 500; color: #374151; }
.required { color: #ef4444; margin-left: 2px; }

/* Input Styles */
.form-input, .form-select, .form-textarea {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
  background: #f9fafb;
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: #6366f1;
    background: white;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}

/* Checkbox */
.checkbox-container { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; font-weight: 500; }
.checkbox-container input { width: 18px; height: 18px; accent-color: #6366f1; cursor: pointer; }

/* =========================================
   8. VARIANT SECTION STYLES
   ========================================= */
.variants-section {
    background: #f3f4f6;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #e5e7eb;
}

.section-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
}
.section-desc { margin: 4px 0 0; color: #6b7280; font-size: 13px; }

.btn-add-variant {
    background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 8px;
    font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;
}
.btn-add-variant span { font-size: 18px; line-height: 0.8; }
.btn-add-variant:hover { background: #4f46e5; }

.empty-variants { text-align: center; color: #9ca3af; padding: 20px; font-style: italic; border: 1px dashed #d1d5db; border-radius: 8px; }

/* Variant Card */
.variant-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.variant-header { display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px; }
.variant-title { margin: 0; font-size: 14px; font-weight: 700; color: #4b5563; }
.btn-remove-variant { color: #ef4444; background: none; border: none; font-size: 13px; cursor: pointer; font-weight: 500; }
.btn-remove-variant:hover { text-decoration: underline; }

.variant-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px;
}
.input-group label { font-size: 12px; color: #6b7280; margin-bottom: 6px; display: block; font-weight: 600; }

/* Attributes */
.attributes-container {
    background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px dashed #e5e7eb;
}
.attr-label { font-size: 13px; font-weight: 600; color: #4b5563; margin-bottom: 8px; display: block; }

.attr-list { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.attr-row { display: flex; gap: 6px; }
.form-input.small { padding: 8px 12px; font-size: 13px; width: 100px; }

.btn-small-dashed {
    border: 1px dashed #9ca3af; color: #6b7280; background: none; padding: 6px 10px; border-radius: 6px;
    font-size: 12px; cursor: pointer; transition: all 0.2s;
}
.btn-small-dashed:hover { border-color: #6366f1; color: #6366f1; background: #eff6ff; }

/* Form Footer */
.form-footer {
    padding: 20px 32px;
    border-top: 1px solid #e5e7eb;
    background: #fff;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
.btn-save {
    padding: 12px 32px; background: #10b981; color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 15px;
    box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
}
.btn-save:hover { background: #059669; }

.btn-cancel {
    padding: 12px 24px; background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; border-radius: 10px; font-weight: 600; cursor: pointer;
}
.btn-cancel:hover { background: #e5e7eb; }

/* Responsive */
@media (max-width: 1280px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .header-actions { margin-top: 16px; width: 100%; justify-content: space-between; }
  .stats-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
  .form-group.full-width { grid-column: span 1; }
  .variant-grid { grid-template-columns: 1fr; }
  .modal-card { width: 100%; height: 100vh; max-width: 100%; border-radius: 0; }
}
</style>