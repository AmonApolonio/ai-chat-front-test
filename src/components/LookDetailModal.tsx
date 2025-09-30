import React from "react";
import { Modal, Row, Col, Card, Button } from "antd";
import { 
  ShoppingOutlined,
  LinkOutlined,
  ReloadOutlined,
  RollbackOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { LookData, ProductItem } from '@/types';
import Image from 'next/image';
import ProductDetailModal from './ProductDetailModal';

interface LookDetailModalProps {
  isVisible: boolean;
  selectedLookData: LookData | null;
  onClose: () => void;
}

export default function LookDetailModal({
  isVisible,
  selectedLookData,
  onClose,
}: LookDetailModalProps) {

  // State for product navigation
  const [modalItemIndices, setModalItemIndices] = React.useState<{ [key: string]: number }>({});
  // State for Look Description modal
  const [descModalOpen, setDescModalOpen] = React.useState(false);
  // State for Product Detail modal
  const [productDetailModalOpen, setProductDetailModalOpen] = React.useState(false);
  const [selectedProductLink, setSelectedProductLink] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (selectedLookData) {
      const categories = ['items1', 'items2', 'items3', 'items4', 'items5'];
      const initialIndices: { [key: string]: number } = {};
      categories.forEach(category => {
        const indexKey = category.replace('items', 'item');
        initialIndices[indexKey] = 0;
      });
      setModalItemIndices(initialIndices);
    }
  }, [selectedLookData]);

  if (!selectedLookData) return null;
  const handleNextItem = (category: string, total: number) => {
    setModalItemIndices(prev => ({
      ...prev,
      [category]: Math.min((prev[category] || 0) + 1, total - 1)
    }));
  };

  const handlePreviousItem = (category: string) => {
    setModalItemIndices(prev => ({
      ...prev,
      [category]: Math.max((prev[category] || 0) - 1, 0)
    }));
  };

  const getItemsForDisplay = () => {
    // Adjust this logic based on actual selectedLookData structure
    // Try both plural and singular keys for compatibility
    const categories = ['items1', 'items2', 'items3', 'items4', 'items5'];
    const displayItems: (ProductItem & { category: string; currentIndex: number; totalItems: number })[] = [];
    categories.forEach(category => {
      let items = selectedLookData[category as keyof LookData] as ProductItem[];
      if (!Array.isArray(items)) {
        if (items) {
          items = [items as ProductItem];
        } else {
          items = [];
        }
      }
      if (items && items.length > 0) {
        // For modalItemIndices, use category without the 's' (e.g., 'item1')
        const indexKey = category.replace('items', 'item');
        const currentIndex = modalItemIndices[indexKey] || 0;
        displayItems.push({
          ...items[currentIndex],
          category: indexKey,
          currentIndex,
          totalItems: items.length
        });
      }
    });
    return displayItems;
  };

  const displayItems = getItemsForDisplay();

  return (
    <>
      <Modal
        title={
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: selectedLookData.descricaoLooks ? 'pointer' : 'default' }}
            onClick={() => {
              if (selectedLookData.descricaoLooks) setDescModalOpen(true);
            }}
          >
            <ShoppingOutlined style={{ color: '#947B62' }} />
            Detalhes do Look
          </div>
        }
        open={isVisible}
        onCancel={onClose}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <div style={{ height: '100%' }}>
          <Row gutter={[16, 16]} style={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
            {displayItems.map((item, index: number) => (
              <Col xs={24} sm={12} md={8} key={index} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
                <Card
                  size="small"
                  style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', minHeight: 0 }}
                  styles={{ body: { display: 'flex', flexDirection: 'column', flex: 1, height: '100%', minHeight: 0, padding: 12 } }}
                  cover={
                    <div style={{ height: '200px', overflow: 'hidden', position: 'relative', border: '0.1px solid #e9e3dcff', borderRadius: '8px' }}>
                      <Image
                        src={item.photo_url}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.png';
                        }}
                      />
                      {/* Navigation Buttons */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        display: 'flex',
                        gap: '4px',
                        flexDirection: 'column'
                      }}>
                        {item.currentIndex > 0 && (
                          <Button
                            size="small"
                            shape="circle"
                            icon={<RollbackOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviousItem(item.category.replace('items', 'item'));
                            }}
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              border: 'none',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          />
                        )}
                        {item.currentIndex < item.totalItems - 1 && (
                           <Button
                             size="small"
                             shape="circle"
                             icon={<ReloadOutlined />}
                             onClick={(e) => {
                               e.stopPropagation();
                               handleNextItem(item.category.replace('items', 'item'), item.totalItems);
                             }}
                             style={{
                               backgroundColor: 'rgba(255, 255, 255, 0.9)',
                               border: 'none',
                               boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                             }}
                           />
                        )}
                      </div>
                    </div>
                  }
                >
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
                      <div style={{ 
                        fontSize: '13px', 
                        lineHeight: '1.3',
                        height: '52px',
                        maxHeight: '52px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                        marginBottom: 4
                      }}>
                        {item.title && item.title.length > 60
                          ? item.title.slice(0, 60) + '...'
                          : item.title}
                      </div>
                      <div style={{ 
                        color: '#666', 
                        fontSize: '11px',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Image 
                          src={item.icon} 
                          alt={item.source}
                          width={12}
                          height={12}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        {item.source}
                      </div>
                      <div style={{ 
                        color: '#947B62',
                        fontWeight: '600',
                        fontSize: '14px',
                        marginBottom: 4
                      }}>
                        R$ {item.price.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                      <Button
                        key="view"
                        type="primary"
                        size="small"
                        icon={<LinkOutlined />}
                        onClick={() => {
                          setSelectedProductLink(item.product_link);
                          setProductDetailModalOpen(true);
                        }}
                        style={{ fontSize: '11px', width: '100%' }}
                      >
                        Ver Produto
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Modal>

      {/* Look Description Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#947B62' }} />
            Descrição do Look
          </div>
        }
        open={descModalOpen}
        onCancel={() => setDescModalOpen(false)}
        footer={null}
        width={500}
        style={{ top: 40 }}
      >
        {selectedLookData.descricaoLooks && (
          <Row gutter={[16, 8]}>
            {Object.entries(selectedLookData.descricaoLooks).map(([key, value]) => (
              <Col span={24} key={key}>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>
                    {key.replace('item', 'Item ')}:
                  </span> {value as string}
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Modal>

      {/* Product Detail Modal */}
      <ProductDetailModal
        isVisible={productDetailModalOpen}
        productLink={selectedProductLink}
        onClose={() => {
          setProductDetailModalOpen(false);
          setSelectedProductLink(null);
        }}
      />
    </>
  );
}