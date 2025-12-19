<template>
  <div class="products-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Quản Lý Sản Phẩm</h1>
        <ul class="breadcrumb">
          <li>Trang chủ</li>
          <li class="separator">/</li>
          <li class="active">Sản phẩm</li>
        </ul>
      </div>
      <div class="header-actions">
        <button @click="openForm()" class="btn btn-black">
          <span class="icon">➕</span> Thêm sản phẩm
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
          <span class="stat-label">Tổng sản phẩm</span>
          <h3 class="stat-value">{{ products.length }}</h3>
          <span class="stat-sub">Sản phẩm trong kho</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper mono">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Còn hàng</span>
          <h3 class="stat-value">{{ inStockCount }}</h3>
          <span class="stat-sub">Sản phẩm có sẵn</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper mono">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Hết hàng</span>
          <h3 class="stat-value">{{ outOfStockCount }}</h3>
          <span class="stat-sub">Cần nhập thêm</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper mono">
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
            <th>SKU</th>
            <th>SẢN PHẨM</th>
            <th>DANH MỤC</th>
            <th>ĐƠN VỊ</th>
            <th>TỒN KHO</th>
            <th v-if="role === 'admin'">GIÁ NHẬP</th>
            <th>GIÁ BÁN</th> 
            <th class="text-right">HÀNH ĐỘNG</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedProducts.length === 0">
            <td colspan="9" class="text-center empty-state">Không tìm thấy sản phẩm nào</td>
          </tr>
          <tr v-for="product in paginatedProducts" :key="product.id">
            <td>
               <span class="sku-tag">{{ product.sku || '---' }}</span>
            </td>
            <td>
              <div class="product-info-cell">
                <div class="product-avatar mono-avatar">
                   {{ product.name ? product.name.charAt(0).toUpperCase() : 'P' }}
                </div>
                <div class="product-details">
                    <span class="product-name-text">{{ product.name }}</span>
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
            
            <td class="font-bold">
                {{ getDisplayPrice(product) }}
            </td>

            <td class="actions text-right">
              <button class="action-btn view" @click="openViewModal(product)" title="Xem chi tiết">
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
                  <textarea v-model="form.description" class="form-textarea" rows="2" placeholder="Mô tả sơ lược..."></textarea>
                </div>
                <div class="form-group full-width">
                  <label>Nội dung chi tiết</label>
                  <textarea v-model="form.content" class="form-textarea" rows="4"></textarea>
                </div>
                <div class="form-group">
                  <label>Đơn vị tính</label>
                  <input v-model="form.base_unit" required class="form-input" placeholder="Cái, Hộp..." />
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
                        <p class="section-desc">Quản lý SKU, giá và thuộc tính (Màu, Size) cho từng biến thể</p>
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
                        <button type="button" @click="removeVariant(index)" class="btn-remove-variant">Xóa</button>
                   </div>
                   
                   <div class="variant-grid">
                      <div class="input-group">
                        <label>Mã SKU <span class="required">*</span></label>
                        <input v-model="variant.sku" required class="form-input" />
                      </div>
                      <div class="input-group">
                        <label>Tên biến thể (Tự động)</label>
                        <input v-model="variant.variant_name" placeholder="VD: 15.6 inch + Màu: Đỏ" class="form-input" />
                      </div>
                      <div class="input-group">
                        <label>Tồn kho</label>
                        <input v-model.number="variant.quantity" type="number" class="form-input" />
                      </div>
                      <div class="input-group">
                        <label>Giá bán lẻ</label>
                        <input v-model.number="variant.retail_price" type="number" class="form-input" />
                      </div>
                      <div class="input-group">
                        <label>Giá vốn</label>
                        <input v-model.number="variant.cost_price" type="number" class="form-input" />
                      </div>
                      <div class="input-group">
                        <label>Giá sỉ</label>
                        <input v-model.number="variant.wholesale_price" type="number" class="form-input" />
                      </div>
                      <div class="input-group full-width">
                        <label>Ảnh URL</label>
                        <input v-model="variant.image_url" placeholder="Link ảnh..." class="form-input" />
                      </div>
                   </div>
                   
                   <div class="attributes-container">
                      <label class="attr-label">Thuộc tính (Gõ "Màu" để chọn màu, nút X để xóa):</label>
                      <div class="attr-list">
                          <div v-for="(attr, attrIndex) in variant.attributes" :key="attrIndex" class="attr-row">
                            
                            <input 
                                v-model="attr.attribute_name" 
                                @input="checkIsColor(attr)"
                                placeholder="Tên (VD: Màu)" 
                                class="form-input small attr-name" 
                            />
                            
                            <div class="value-wrapper">
                                <template v-if="attr.is_color">
                                    <div class="color-input-group">
                                        <input 
                                            v-model="attr.attribute_value" 
                                            @input="updateVariantName(index)"
                                            placeholder="Tên màu (VD: Đỏ)" 
                                            class="form-input small color-name-input"
                                        />
                                        <input 
                                            type="color" 
                                            v-model="attr.color_hex" 
                                            @input="updateVariantName(index)"
                                            class="color-picker-input"
                                        />
                                        <span class="color-hex-text">{{ attr.color_hex }}</span>
                                    </div>
                                </template>
                                <template v-else>
                                    <input 
                                        v-model="attr.attribute_value" 
                                        @input="updateVariantName(index)"
                                        placeholder="Giá trị (VD: 15.6 inch)" 
                                        class="form-input small" 
                                    />
                                </template>
                            </div>

                            <button type="button" @click="removeAttribute(index, attrIndex)" class="btn-remove-attr" title="Xóa thuộc tính">
                                &times;
                            </button>
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

    <div v-if="showViewModal" class="modal-overlay" @click="showViewModal = false">
      <div class="view-modal-card" @click.stop>
         <button class="btn-close-view" @click="showViewModal = false">×</button>
         <div class="view-body-grid">
            
            <div class="view-gallery">
                <div class="main-image-wrapper">
                     <img :src="currentMainImage" class="view-main-img">
                </div>
                <div class="thumb-list">
                    <div v-for="(img, idx) in allImages" :key="idx" 
                         class="thumb-item" 
                         :class="{ active: currentMainImage === img }"
                         @click="setActiveImage(img)">
                        <img :src="img" />
                    </div>
                </div>
            </div>

            <div class="view-info">
                <div class="view-breadcrumbs">
                    <span>{{ getCategoryName(viewingProduct.category_id) }}</span> 
                    <span v-if="viewingProduct.brand_id"> / {{ getBrandName(viewingProduct.brand_id) }}</span>
                </div>

                <h1 class="view-product-title">{{ viewingProduct.name }}</h1>
                
                <div class="view-meta-row">
                    <div class="view-meta-item">
                        <span class="label">SKU:</span>
                        <span class="value">{{ selectedVariantSKU || viewingProduct.sku || 'N/A' }}</span>
                    </div>
                    <div class="view-meta-item status">
                        <span class="status-dot" :class="selectedVariantStock > 0 ? 'bg-green' : 'bg-red'"></span>
                        <span class="value">{{ selectedVariantStock > 0 ? selectedVariantStock + ' In Stock' : 'Out of Stock' }}</span>
                    </div>
                    <div class="view-meta-item">
                        <span class="label">Trạng thái:</span>
                        <span class="value">
                            {{ getStatusText(viewingProduct.status) }}
                        </span>
                    </div>
                </div>

                <div class="view-price-large">
                    {{ formatPrice(selectedVariantPrice || viewingProduct.retail_price) }}
                </div>

                <div class="view-description">
                    {{ viewingProduct.description || 'Chưa có mô tả ngắn.' }}
                </div>

                <div class="view-content">
                    <h3>Nội dung chi tiết:</h3>
                    {{ viewingProduct.content || 'Chưa có nội dung chi tiết.' }}
                </div>

                <div class="view-pricing-details" v-if="role === 'admin' && selectedVariantIndex !== -1">
                    <h3>Chi tiết giá (biến thể chọn):</h3>
                    <div class="pricing-item">Giá vốn: {{ formatPrice(selectedVariant.cost_price) }}</div>
                    <div class="pricing-item">Giá bán lẻ: {{ formatPrice(selectedVariant.retail_price) }}</div>
                    <div class="pricing-item">Giá bán sỉ: {{ formatPrice(selectedVariant.wholesale_price) }}</div>
                </div>
                <div class="view-pricing-details" v-else-if="role !== 'admin' && selectedVariantIndex !== -1">
                    <h3>Chi tiết giá:</h3>
                    <div class="pricing-item">Giá bán lẻ: {{ formatPrice(selectedVariant.retail_price) }}</div>
                </div>

                <div class="divider"></div>

                <div class="view-variants-selector" v-if="viewingVariants.length > 0">
                    
                    <div v-if="hasColorAttributes" class="selector-group">
                        <span class="selector-label">Color</span>
                        <div class="color-swatches">
                             <div v-for="(v, idx) in viewingVariants" :key="idx" 
                                  class="color-swatch"
                                  :class="{ selected: selectedVariantIndex === idx }"
                                  :style="{ backgroundColor: getVariantColor(v) }"
                                  @click="selectVariant(idx)"
                                  :title="v.variant_name">
                             </div>
                        </div>
                    </div>

                    <div class="selector-group">
                        <span class="selector-label">Biến thể / Size</span>
                        <div class="size-boxes">
                            <button v-for="(v, idx) in viewingVariants" :key="idx"
                                class="size-box" 
                                :class="{ selected: selectedVariantIndex === idx }"
                                @click="selectVariant(idx)">
                                {{ v.variant_name }}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="view-actions">
                    <div class="qty-control">
                        <button>-</button>
                        <input value="1" readonly>
                        <button>+</button>
                    </div>
                    <button class="btn-add-cart">ADD TO CART</button>
                    <button class="btn-wishlist">♡</button>
                </div>
            </div>
         </div>
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
      form: {
        name: '', slug: '', category_id: '', brand_id: '', description: '',
        content: '', base_unit: '', status: 'draft', product_type: 'goods',
        is_for_sale: true, variants: []
      },
      role: 'staff',
      showViewModal: false,
      viewingProduct: {},
      viewingVariants: [],
      selectedVariantIndex: -1,
      activeImage: ''
    }
  },
  
  async mounted() {
    await Promise.all([
      this.loadProducts(),
      this.loadCategories(),
      this.loadBrands(),
      this.loadRole()
    ])
  },

  computed: {
    // Logic lọc sản phẩm
    filteredProducts() {
      return this.products.filter(p => {
        const query = this.searchQuery.toLowerCase();
        const matchesSearch = 
            (p.name && p.name.toLowerCase().includes(query)) || 
            (p.sku && p.sku.toLowerCase().includes(query));
        const matchesCategory = !this.filterCategory || p.category_id === this.filterCategory;
        const matchesStatus = !this.filterStatus || p.status === this.filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
      })
    },
    // View Modal Logic
    selectedVariant() {
        if (this.selectedVariantIndex !== -1 && this.viewingVariants[this.selectedVariantIndex]) 
            return this.viewingVariants[this.selectedVariantIndex];
        return {};
    },
    selectedVariantPrice() {
        return this.selectedVariant.retail_price || this.viewingProduct.retail_price;
    },
    selectedVariantStock() {
        return this.selectedVariant.quantity || this.viewingProduct.total_stock || 0;
    },
    selectedVariantSKU() {
        return this.selectedVariant.sku || this.viewingProduct.sku;
    },
    currentMainImage() {
        if (this.activeImage) return this.activeImage;
        if (this.selectedVariantIndex !== -1 && this.viewingVariants[this.selectedVariantIndex]?.image_url) {
            return this.viewingVariants[this.selectedVariantIndex].image_url;
        }
        return this.viewingProduct.image_url || 'https://via.placeholder.com/500x500?text=No+Image';
    },
    allImages() {
        const imgs = [];
        if (this.viewingProduct.image_url) imgs.push(this.viewingProduct.image_url);
        this.viewingVariants.forEach(v => { if(v.image_url) imgs.push(v.image_url) });
        return [...new Set(imgs)];
    },
    // Kiểm tra xem có thuộc tính màu không (để hiện Swatches)
    hasColorAttributes() {
        return this.viewingVariants.some(v => 
            v.attributes && Array.isArray(v.attributes) && v.attributes.some(a => 
                ['color', 'màu', 'mau', 'colour'].includes((a.attribute_name || '').toLowerCase())
            )
        );
    },
    // Pagination
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredProducts.slice(start, start + this.pageSize);
    },
    totalPages() { return Math.ceil(this.filteredProducts.length / this.pageSize) || 1; },
    inStockCount() { return this.products.filter(p => (p.total_stock || 0) > 0).length; },
    outOfStockCount() { return this.products.filter(p => (p.total_stock || 0) === 0).length; }
  },

  methods: {
    // --- LOAD DATA ---
    async loadProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(retail_price)') 
        .order('id', { ascending: false });

      if (error) console.error('Lỗi load sản phẩm:', error);
      else this.products = data || [];
    },

    getStatusText(status) {
        if (status === 'active') return 'Đang bán';
        if (status === 'draft') return 'Nháp';
        if (status === 'inactive') return 'Ngừng bán';
        return 'Không xác định'; // phòng trường hợp 0 hoặc giá trị lạ
    },

    // Hiển thị giá Min - Max
    getDisplayPrice(product) {
        if (!product.product_variants || product.product_variants.length === 0) {
            return this.formatPrice(product.retail_price);
        }
        const prices = product.product_variants
             .map(v => Number(v.retail_price))
             .filter(p => p > 0);
        
        if (prices.length === 0) return this.formatPrice(product.retail_price);
        if (prices.length === 1) return this.formatPrice(prices[0]);

        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (min === max) return this.formatPrice(min);
        return `${this.formatPrice(min)} - ${this.formatPrice(max)}`;
    },

    // --- EXCEL ---
    exportToExcel() {
      if (this.products.length === 0) return alert("Không có dữ liệu để xuất");
      const data = this.products.map(p => ({
          'SKU': p.sku, 'Tên': p.name,
          'Danh mục': this.getCategoryName(p.category_id),
          'Giá hiển thị': this.getDisplayPrice(p), 'Tồn': p.total_stock
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "SP");
      XLSX.writeFile(wb, "Danh_Sach_SanPham.xlsx");
    },

    // --- FORM LOGIC ---
    async openForm(product = null) {
      this.editingProduct = product;
      if (product) {
        const variants = await this.fetchVariantsForProduct(product.id);
        // Map variants và check luôn xem có màu không để bật Color Picker
        this.form = { 
            ...product, 
            variants: variants.map(v => ({
                ...v,
                attributes: Array.isArray(v.attributes) ? v.attributes.map(a => ({
                    ...a,
                    is_color: ['màu', 'mau', 'color', 'colour'].includes((a.attribute_name||'').toLowerCase()),
                    color_hex: a.color_hex || ''
                })) : [] 
            })) 
        };
        this.showForm = true;
      } else {
        this.form = {
          name: '', slug: '', category_id: '', brand_id: '', description: '',
          content: '', base_unit: '', status: 'draft', product_type: 'goods',
          is_for_sale: true, variants: []
        };
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
        return error ? [] : data;
    },

    async saveProduct() {
      try {
        let calculatedStock = 0;
        let mainRetailPrice = 0;
        let mainSKU = '';
        
        if (this.form.variants.length > 0) {
           calculatedStock = this.form.variants.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0);
           mainRetailPrice = Number(this.form.variants[0].retail_price) || 0;
           mainSKU = this.form.variants[0].sku;
        }

        const payload = {
           name: this.form.name,
           slug: this.form.slug,
           category_id: this.form.category_id,
           brand_id: this.form.brand_id,
           description: this.form.description,
           content: this.form.content,
           base_unit: this.form.base_unit,
           status: this.form.status,
           total_stock: calculatedStock,
           retail_price: mainRetailPrice,
           sku: mainSKU
        };

        let productId;
        if (this.editingProduct) {
            const { error } = await supabase.from('products').update(payload).eq('id', this.editingProduct.id);
            if (error) throw error;
            productId = this.editingProduct.id;
        } else {
            const { data, error } = await supabase.from('products').insert(payload).select('id').single();
            if (error) throw error;
            productId = data.id;
        }

        // Xóa cũ thêm mới variants
        await supabase.from('product_variants').delete().eq('product_id', productId);

        if (this.form.variants.length > 0) {
            const variantsToInsert = this.form.variants.map(v => ({
                product_id: productId,
                sku: v.sku,
                variant_name: v.variant_name,
                quantity: Number(v.quantity) || 0,
                retail_price: Number(v.retail_price) || 0,
                cost_price: Number(v.cost_price) || 0,
                wholesale_price: Number(v.wholesale_price) || 0,
                image_url: v.image_url,
                attributes: v.attributes.map(a => ({
                    attribute_name: a.attribute_name,
                    attribute_value: a.attribute_value,
                    color_hex: a.color_hex || null
                })) // Lưu thẳng JSON với color_hex nếu có
            }));

            const { error: vError } = await supabase.from('product_variants').insert(variantsToInsert);
            if (vError) throw vError;
        }

        alert('Lưu sản phẩm thành công!');
        this.showForm = false;
        await this.loadProducts();

      } catch (err) {
        console.error("Lỗi Save:", err);
        alert('Có lỗi xảy ra: ' + err.message);
      }
    },

    // --- VARIANT LOGIC (Tự động tên + Xóa + Màu) ---
    addVariant() {
      this.form.variants.push({
        sku: '', variant_name: '', quantity: 0, retail_price: 0, 
        cost_price: 0, wholesale_price: 0, attributes: [], image_url: ''
      });
    },
    
    addAttribute(variantIndex) {
      if(!this.form.variants[variantIndex].attributes) this.form.variants[variantIndex].attributes = [];
      this.form.variants[variantIndex].attributes.push({ attribute_name: '', attribute_value: '', color_hex: '', is_color: false });
    },

    removeAttribute(variantIndex, attrIndex) {
        this.form.variants[variantIndex].attributes.splice(attrIndex, 1);
        this.updateVariantName(variantIndex);
    },

    checkIsColor(attr) {
        const name = (attr.attribute_name || '').toLowerCase().trim();
        attr.is_color = ['màu', 'mau', 'color', 'colour'].includes(name);
    },

    updateVariantName(index) {
        const variant = this.form.variants[index];
        if (variant.attributes && variant.attributes.length > 0) {
            const values = variant.attributes
                .map(a => `${a.attribute_name}: ${a.attribute_value}`)
                .filter(v => v && v.trim() !== '');
            if (values.length > 0) {
                variant.variant_name = values.join(' + ');
            }
        } else {
            variant.variant_name = '';
        }
    },
    
    removeVariant(index) { this.form.variants.splice(index, 1); },

    // --- VIEW MODAL HELPERS ---
    async openViewModal(product) {
        this.viewingProduct = product;
        this.selectedVariantIndex = -1;
        this.activeImage = '';
        const variants = await this.fetchVariantsForProduct(product.id);
        this.viewingVariants = variants.map(v => ({
            ...v,
            attributes: Array.isArray(v.attributes) ? v.attributes.map(a => ({
                ...a,
                is_color: ['màu', 'mau', 'color', 'colour'].includes((a.attribute_name||'').toLowerCase())
            })) : [] 
        }));
        this.showViewModal = true;
    },
    selectVariant(index) { this.selectedVariantIndex = index; this.activeImage = ''; },
    setActiveImage(img) { this.activeImage = img; },
    
    // Hiển thị màu (Hex hoặc tên)
    getVariantColor(variant) {
        if (!variant.attributes || !Array.isArray(variant.attributes)) return '#eee';
        const colorAttr = variant.attributes.find(a => 
            ['color', 'màu', 'mau', 'colour'].includes((a.attribute_name || '').toLowerCase())
        );
        if (!colorAttr || !colorAttr.attribute_value) return '#eee';

        const val = colorAttr.color_hex || colorAttr.attribute_value.toLowerCase();
        if (val.startsWith('#')) return val; // Nếu là mã Hex từ Picker

        const colorMap = { 'đỏ': 'red', 'xanh': 'blue', 'đen': 'black', 'trắng': 'white', 'vàng': 'yellow' };
        return colorMap[val] || val; 
    },

    // --- COMMON HELPERS ---
    async loadCategories() {
       const { data } = await supabase.from('categories').select('id, name');
       this.categories = data || [];
    },
    async loadBrands() {
       const { data } = await supabase.from('brands').select('id, name');
       this.brands = data || [];
    },
    async loadRole() {
      if (!this.$root.user) return;
      const { data } = await supabase.from('profiles').select('role').eq('id', this.$root.user.id).single();
      this.role = data?.role || 'staff';
    },
    async deleteProduct(id) {
        if(confirm("Xóa sản phẩm?")) {
            await supabase.from('products').delete().eq('id', id);
            this.loadProducts();
        }
    },
    formatPrice(price) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0); },
    getCategoryName(id) { const c = this.categories.find(x => x.id === id); return c ? c.name : '—'; },
    getBrandName(id) { const b = this.brands.find(x => x.id === id); return b ? b.name : ''; },
    getStockClass(stock) { return (!stock || stock <= 0) ? 'out-stock' : (stock <= 10 ? 'low-stock' : 'in-stock'); }
  },
  filters: {
    capitalize: function (value) {
      if (!value) return '';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  }
}
</script>

<style scoped>
/* =========================================
   0. RESET & GLOBAL
   ========================================= */
* {
  box-sizing: border-box;
}

.products-page {
  padding: 32px 40px;
  background-color: #ffffff;
  min-height: 100vh;
  color: #1f2937;
}
.products-page ::placeholder, .products-page select {
  font-family: 'Quicksand',-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* =========================================
   1. HEADER & ACTIONS
   ========================================= */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
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
.breadcrumb .icon { margin-right: 4px; }

.header-actions {
  display: flex;
  gap: 12px;
}

/* BUTTONS (MONOCHROME) */
.btn {
  padding: 10px 20px;
  border-radius: 0.2rem;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-black {
  background: #000000;
  color: #ffffff;
  border: 1px solid #000000;
}
.btn-black:hover {
  background: #333333;
  border-color: #333333;
}

.btn-white {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #374151;
}
.btn-white:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.icon { font-size: 16px; line-height: 1; }

/* =========================================
   2. STATS GRID (MONOCHROME)
   ========================================= */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.stat-icon-wrapper.mono {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6; /* Xám nhạt */
  color: #000;
}
.stat-icon-wrapper svg { width: 24px; height: 24px; }

.stat-content { display: flex; flex-direction: column; }
.stat-label { color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
.stat-value { font-size: 24px; font-weight: 700; color: #111827; margin: 0; }
.stat-sub { color: #9ca3af; font-size: 12px; margin-top: 2px; }

/* =========================================
   3. FILTER BAR
   ========================================= */
.filter-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 20px;
  flex-wrap: wrap;
}

.search-wrapper { position: relative; flex: 1; min-width: 300px; }
.search-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  width: 18px; color: #9ca3af;
}
.search-input {
  width: 100%; padding: 10px 10px 10px 40px;
  border: 1px solid #e5e7eb; border-radius: 0.2rem;
  outline: none; font-size: 14px;
  min-height: 42px;
}
.search-input:focus { border-color: #000; }

.filter-actions { display: flex; gap: 12px; }
.filter-select {
  padding: 10px 30px 10px 15px;
  border: 1px solid #e5e7eb; border-radius: 0.2rem;
  background: white; outline: none; cursor: pointer;
  font-size: 14px;
}

/* =========================================
   4. DATA TABLE
   ========================================= */
.table-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow-x: auto; /* Quan trọng: Fix lỗi vỡ layout khi bảng quá rộng */
  margin-bottom: 24px;
}

.product-table { width: 100%; border-collapse: collapse; min-width: 900px; }

.product-table th {
  background: #f9fafb;
  padding: 14px 20px;
  text-align: center;
  font-size: 12px; font-weight: 700; color: #6b7280;
  text-transform: uppercase; border-bottom: 1px solid #e5e7eb;
}

.product-table td {
  padding: 14px 20px;
  vertical-align: middle;
  font-size: 14px; color: #374151;
}

.product-table tr {
  border-bottom: 1px solid #f3f4f6;
}

/* Avatar Cell */
.product-info-cell { display: flex; align-items: center; gap: 12px; }
.product-avatar.mono-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #000;
  border: 1px solid #e5e7eb;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 16px;
}
.product-name-text { font-weight: 600; color: #111827; }

/* Badges & Actions */
.sku-tag { padding: 4px 8px; border-radius: 0.2rem; font-size: 12px; }
.category-tag { background: #f3f4f6; color: #4b5563; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; border: 1px solid #e5e7eb; }

.stock-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.stock-badge.in-stock { background: #ecfdf5; color: #059669; }
.stock-badge.out-stock { background: #fef2f2; color: #dc2626; }
.stock-badge.low-stock { background: #fffbeb; color: #d97706; }

.actions { display: flex; justify-content: flex-end; gap: 6px; }
.action-btn {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: white; color: #6b7280;
  display: grid; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.action-btn:hover { border:none; color: #000; background: rgb(240, 239, 239) }
.action-btn svg { width: 16px; height: 16px; }
.text-right { text-align: right; }
.font-bold { font-weight: 600; }

/* Pagination */
.pagination-wrapper { display: flex; justify-content: space-between; align-items: center; padding: 0 8px; flex-wrap: wrap; gap: 10px; }
.pagination-controls { display: flex; gap: 8px; }
.btn-page-nav, .page-number {
  width: 40px; height: 40px;
  display: grid; align-items: center; justify-content: center;
  border: 1px solid #e5e7eb; background: white; border-radius: 0.2rem;
  cursor: pointer;
}
.page-number.active { background: #000; color: white; border-color: #000; }

/* =========================================
   5. FORM MODAL (ADD/EDIT)
   ========================================= */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(2px);
}

.modal-card {
  background: white;
  width: 900px;
  max-width: 95vw;
  max-height: 90vh;
  border-radius: 0.2rem;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex; justify-content: space-between; align-items: center;
}
.modal-header h2 { margin: 0; font-size: 18px; font-weight: 700; }
.btn-close-modal { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; }

.product-form { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
.form-scrollable-content { flex: 1; overflow-y: auto; padding: 24px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: span 2; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; text-align: justify; }
.required { color: red; }

.form-input, .form-select, .form-textarea {
  padding: 10px; border: 1px solid #e9eaeb; border-radius: 0.2rem;
  font-size: 14px; outline: none; width: 100%;
}
.form-input:focus { border-color: #000; }

/* Variants Section */
.variants-section { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.2rem; padding: 20px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.form-section-title { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
.section-desc { font-size: 12px; color: #6b7280; margin: 0; }
.btn-add-variant { background: #000; color: white; border: none; padding: 6px 12px; border-radius: 0.2rem; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 4px; }

.variant-card { background: white; border: 1px solid #e5e7eb; padding: 16px; border-radius: 0.2rem; margin-bottom: 12px; }
.variant-header { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #e5e7eb; padding-bottom: 8px; }
.variant-title { margin: 0; font-size: 13px; font-weight: 700; }
.btn-remove-variant { color: #ef4444; background: none; border: none; cursor: pointer; font-size: 12px; }

.variant-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px; }
.input-group label { font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 4px; display: block; text-align: justify; }

/* ATTRIBUTES STYLES */
.attributes-container { border-top: 1px dashed #e5e7eb; padding-top: 10px; }
.attr-label { font-size: 12px; font-weight: 600; margin-bottom: 8px; display: block; }
.attr-list { display: flex; flex-wrap: wrap; gap: 8px; }
.attr-row { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e5e7eb; padding: 4px; border-radius: 0.2rem; }
.btn-remove-attr { width: 24px; height: 24px; border: none; background: #fee2e2; color: #dc2626; border-radius: 0.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.btn-remove-attr:hover { background: #dc2626; color: white; }

.value-wrapper { display: flex; align-items: center; }
.color-input-group { display: flex; align-items: center; gap: 5px; border: 1px solid #d1d5db; border-radius: 0.2rem; padding: 2px 6px 2px 2px; background: white; height: 38px; }
.color-name-input { width: 100px; }
.color-picker-input { width: 32px; height: 32px; padding: 0; border: none; background: none; cursor: pointer; }
.color-hex-text { font-size: 11px; color: #555; min-width: 50px; }

.form-input.small { padding: 6px 10px; font-size: 12px; }
.form-input.small.attr-name { width: 80px; font-weight: 600; }
.btn-small-dashed { border: 1px dashed #d1d5db; background: white; padding: 6px 10px; border-radius: 0.2rem; cursor: pointer; font-size: 12px; }

.form-footer { padding: 20px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px; background: white; }
.btn-save { background: #000; color: white; border: none; padding: 10px 24px; border-radius: 0.2rem; font-weight: 600; cursor: pointer; }
.btn-cancel { background: white; border: 1px solid #e5e7eb; padding: 10px 20px; border-radius: 0.2rem; cursor: pointer; }

/* =========================================
   6. VIEW MODAL (CLEAN E-COMMERCE STYLE)
   ========================================= */
.view-modal-card {
  background: white;
  width: 1000px;
  max-width: 95vw;
  height: 700px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.btn-close-view {
  position: absolute; top: 10px; right: 15px; 
  z-index: 20; background: none; border: none; 
  font-size: 32px; cursor: pointer; color: #666;
}

.view-body-grid {
  display: flex;
  flex: 1;
  overflow: hidden; 
}

/* Cột trái: Ảnh */
.view-gallery {
  flex: 1.3;
  background: #fdfdfd;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  padding: 30px;
  gap: 20px;
}

.main-image-wrapper {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid #eee; background: white; padding: 10px;
}
.view-main-img { max-width: 100%; max-height: 100%; object-fit: contain; }

.thumb-list {
  display: flex; gap: 10px; justify-content: center; height: 80px;
}
.thumb-item {
  width: 60px; height: 100%; 
  border: 1px solid transparent; cursor: pointer; opacity: 0.6; 
  transition: all 0.2s;
}
.thumb-item.active { opacity: 1; border: 1px solid #000; }
.thumb-item img { width: 100%; height: 100%; object-fit: cover; }

/* Cột phải: Thông tin */
.view-info {
  flex: 1;
  padding: 40px;
  overflow-y: auto; 
  display: flex; flex-direction: column;
}

.view-breadcrumbs { font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 10px; letter-spacing: 0.5px; }
.view-product-title { font-size: 26px; font-weight: 500; margin: 0 0 15px 0; line-height: 1.3; }

.view-meta-row { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; font-size: 13px; color: #555; flex-wrap: wrap; }
.view-meta-item { display: flex; align-items: center; gap: 5px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.bg-green { background-color: #22c55e; }
.bg-red { background-color: #ef4444; }

.view-price-large { font-size: 24px; font-weight: 600; color: #000; margin-bottom: 20px; }
.view-description { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }

.view-content { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 30px; }
.view-pricing-details { margin-bottom: 30px; }
.view-pricing-details h3 { font-size: 16px; margin-bottom: 10px; }
.pricing-item { margin-bottom: 5px; }

/* Selectors */
.selector-group { margin-bottom: 20px; }
.selector-label { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 10px; display: block; }
.color-swatches { display: flex; gap: 10px; }
.color-swatch { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #e5e5e5; cursor: pointer; }
.color-swatch.selected { border: 2px solid #000; transform: scale(1.1); }

.size-boxes { display: flex; flex-wrap: wrap; gap: 10px; }
.size-box { 
  min-width: 44px; height: 40px; padding: 0 12px;
  border: 1px solid #e5e5e5; background: white; 
  display: flex; align-items: center; justify-content: center; 
  font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.size-box:hover { border-color: #999; }
.size-box.selected { background: #000; color: white; border-color: #000; }

.view-actions { display: flex; gap: 15px; margin-top: auto; padding-top: 20px; }
.qty-control { display: flex; border: 1px solid #e5e5e5; height: 48px; }
.qty-control button { width: 40px; background: none; border: none; font-size: 18px; cursor: pointer; }
.qty-control input { width: 40px; text-align: center; border: none; outline: none; font-weight: 600; }

.btn-add-cart { 
  flex: 1; height: 48px; 
  background: #000; color: white; 
  border: none; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; 
  cursor: pointer; transition: background 0.2s;
}
.btn-add-cart:hover { background: #333; }
.btn-wishlist { width: 48px; height: 48px; border: 1px solid #e5e5e5; background: white; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

/* =========================================
   7. RESPONSIVE (MOBILE FIX)
   ========================================= */
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .view-modal-card { width: 95vw; height: 80vh; }
}

@media (max-width: 768px) {
  .products-page { padding: 16px; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .header-actions { width: 100%; justify-content: space-between; margin-top: 10px; }
  .stats-grid { grid-template-columns: 1fr; }
  
  .filter-bar { flex-direction: column; }
  .search-wrapper { width: 100%; }
  
  /* Modal responsive */
  .modal-card { width: 100%; height: 100%; border-radius: 0; }
  .form-grid { grid-template-columns: 1fr; }
  .form-group.full-width { grid-column: span 1; }
  .variant-grid { grid-template-columns: 1fr; }
  
  /* View Modal responsive */
  .view-modal-card { height: 100vh; border-radius: 0; }
  .view-body-grid { flex-direction: column; overflow-y: auto; }
  .view-gallery { flex: none; height: auto; border-right: none; border-bottom: 1px solid #eee; padding: 20px; }
  .main-image-wrapper { height: 300px; }
  .view-info { overflow: visible; padding: 20px; }
}
</style>