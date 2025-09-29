import React, { useState, useCallback } from "react";
import { Modal, Row, Col, Card, Button, Rate, Tag, Image, Carousel } from "antd";
import { 
  ShoppingOutlined,
  LinkOutlined,
  ShopOutlined,
  TruckOutlined,
  ClockCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';

interface Store {
  name: string;
  logo: string;
  link: string;
  title: string;
  rating?: number;
  reviews?: number;
  details_and_offers?: string[];
  price: string;
  extracted_price: number;
  shipping?: string;
  shipping_extracted?: number;
  total?: string;
  extracted_total?: number;
}

interface ProductResults {
  thumbnails: string[];
  title: string;
  brand: string;
  stores: Store[];
}

interface SearchMetadata {
  id: string;
  status: string;
  json_endpoint: string;
  created_at: string;
  processed_at: string;
  google_immersive_product_url: string;
  raw_html_file: string;
  prettify_html_file: string;
  total_time_taken: number;
}

interface SearchParameters {
  engine: string;
  page_token: string;
}

interface ProductDetailsData {
  search_metadata?: SearchMetadata;
  search_parameters?: SearchParameters;
  product_results: ProductResults;
}

interface ProductDetailModalProps {
  isVisible: boolean;
  productLink: string | null;
  onClose: () => void;
}

export default function ProductDetailModal({
  isVisible,
  productLink,
  onClose,
}: ProductDetailModalProps) {
  const [productData, setProductData] = useState<ProductDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractPageToken = (productLink: string): string | null => {
    try {
      // The product_link should now contain just the page_token
      // If it's a full URL, extract the page_token parameter
      if (productLink.includes('page_token=')) {
        const url = new URL(productLink);
        return url.searchParams.get('page_token');
      }
      // If it's just the token, return it as is
      return productLink;
    } catch (error) {
      console.error('Error extracting page token:', error);
      return null;
    }
  };

  const fetchProductDetails = useCallback(async (link: string) => {
    setLoading(true);
    setError(null);
    try {
      const pageToken = extractPageToken(link);
      
      if (!pageToken) {
        throw new Error('Invalid product link or missing page token');
      }

      const response = await fetch('/api/product-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch product details');
      }

      const data = await response.json();
      setProductData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product details');
      console.error('Error fetching product details:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isVisible && productLink) {
      fetchProductDetails(productLink);
    }
  }, [isVisible, productLink]);

  const handleClose = () => {
    setProductData(null);
    setError(null);
    onClose();
  };

  if (!productData && !loading && !error) {
    return null;
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingOutlined style={{ color: '#947B62' }} />
          Detalhes do Produto
        </div>
      }
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      width={900}
      style={{ top: 20 }}
    >
      {loading && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '16px',
          gap: '8px'
        }}>
          <LoadingOutlined style={{ color: '#947B62' }} />
          Carregando detalhes do produto...
        </div>
      )}

      {error && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          color: '#ff4d4f',
          fontSize: '16px'
        }}>
          {error}
        </div>
      )}

      {productData && (
        <div>
          <Row gutter={[24, 24]}>
            {/* Product Images */}
            <Col xs={24} md={12}>
              <Card 
                size="small" 
                style={{ height: '100%' }}
                styles={{ body: { padding: 12 } }}
              >
                {productData.product_results.thumbnails && productData.product_results.thumbnails.length > 0 ? (
                  <Carousel autoplay>
                    {productData.product_results.thumbnails.map((thumbnail, index) => (
                      <div key={index}>
                        <Image
                          src={thumbnail}
                          alt={`${productData.product_results.title} - Imagem ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '300px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                          fallback="/placeholder-image.png"
                          preview={{
                            mask: <div style={{ fontSize: '16px' }}>Ver Imagem</div>
                          }}
                        />
                      </div>
                    ))}
                  </Carousel>
                ) : (
                  <div style={{
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px'
                  }}>
                    Nenhuma imagem disponível
                  </div>
                )}
              </Card>
            </Col>

            {/* Product Information */}
            <Col xs={24} md={12}>
              <div style={{ height: '100%' }}>
                <h2 style={{ marginBottom: '16px', fontSize: '20px', lineHeight: '1.3' }}>
                  {productData.product_results.title}
                </h2>
                
                {productData.product_results.brand && (
                  <Tag color="blue" style={{ marginBottom: '16px', fontSize: '12px' }}>
                    {productData.product_results.brand}
                  </Tag>
                )}

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShopOutlined style={{ color: '#947B62' }} />
                    Lojas Disponíveis ({productData.product_results.stores?.length || 0})
                  </h3>
                  
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {productData.product_results.stores?.map((store, index) => (
                      <Card 
                        key={index}
                        size="small" 
                        style={{ 
                          marginBottom: '12px',
                          border: '1px solid #e9e3dcff'
                        }}
                        styles={{ body: { padding: 12 } }}
                      >
                        <Row align="middle" gutter={[12, 8]}>
                          <Col flex="none">
                            <img 
                              src={store.logo}
                              alt={store.name}
                              style={{ 
                                width: '32px', 
                                height: '32px',
                                borderRadius: '4px',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </Col>
                          <Col flex="auto">
                            <div>
                              <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
                                {store.name}
                              </div>
                              {store.rating && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                  <Rate 
                                    disabled 
                                    defaultValue={store.rating} 
                                    style={{ fontSize: '12px' }}
                                  />
                                  <span style={{ fontSize: '11px', color: '#666' }}>
                                    ({store.reviews?.toLocaleString()} avaliações)
                                  </span>
                                </div>
                              )}
                              <div style={{ 
                                fontSize: '16px', 
                                fontWeight: '600', 
                                color: '#947B62',
                                marginBottom: '4px'
                              }}>
                                {store.price}
                                {store.shipping && (
                                  <span style={{ 
                                    fontSize: '11px', 
                                    color: '#666', 
                                    fontWeight: '400',
                                    marginLeft: '4px'
                                  }}>
                                    {store.shipping}
                                  </span>
                                )}
                              </div>
                              {store.total && store.total !== store.price && (
                                <div style={{ 
                                  fontSize: '14px', 
                                  fontWeight: '500',
                                  color: '#333'
                                }}>
                                  Total: {store.total}
                                </div>
                              )}
                              {store.details_and_offers && (
                                <div style={{ marginTop: '8px' }}>
                                  {store.details_and_offers.map((detail, detailIndex) => (
                                    <div key={detailIndex} style={{ 
                                      fontSize: '11px', 
                                      color: '#666',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      marginBottom: '2px'
                                    }}>
                                      {detail.includes('Entrega') && <TruckOutlined />}
                                      {detail.includes('dia') && <ClockCircleOutlined />}
                                      {detail}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Col>
                          <Col flex="none">
                            <Button
                              type="primary"
                              size="small"
                              icon={<LinkOutlined />}
                              onClick={() => window.open(store.link, '_blank')}
                              style={{ fontSize: '11px' }}
                            >
                              Visitar Loja
                            </Button>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </Modal>
  );
}