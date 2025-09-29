import { LookData } from '@/types';

interface SimplifiedLookComponentProps {
  allLooks: LookData[];
  remainingLooks: number;
  onLookClick: (look: LookData) => void;
}

// Helper function to get first item from each category
const getFirstItemFromEachCategory = (lookData: LookData) => {
  const items = [];
  
  if (lookData.items1?.[0]) items.push({ ...lookData.items1[0], category: 'item1' });
  if (lookData.items2?.[0]) items.push({ ...lookData.items2[0], category: 'item2' });
  if (lookData.items3?.[0]) items.push({ ...lookData.items3[0], category: 'item3' });
  if (lookData.items4?.[0]) items.push({ ...lookData.items4[0], category: 'item4' });
  if (lookData.items5?.[0]) items.push({ ...lookData.items5[0], category: 'item5' });
  
  return items;
};

export default function SimplifiedLookComponent({ 
  allLooks, 
  remainingLooks, 
  onLookClick 
}: SimplifiedLookComponentProps) {
  const displayLooks = allLooks.length > 0 ? allLooks : [];
  
  return (
    <div style={{ marginTop: '8px', width: '100%' }}>
      <div style={{
        overflowX: 'auto',
        paddingBottom: '8px'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          minWidth: 'fit-content'
        }}>
          {displayLooks.map((look, lookIndex) => {
            const items = getFirstItemFromEachCategory(look);
            return (
              <div
                key={lookIndex}
                style={{
                  minWidth: '200px',
                  border: '1px solid #e9e3dcff',
                  borderRadius: '12px',
                  padding: '12px',
                  backgroundColor: '#ffffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => onLookClick(look)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '6px',
                  marginBottom: '8px'
                }}>
                  {items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      style={{
                        aspectRatio: '1',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#fff'
                      }}
                    >
                      <img
                        src={item.photo_url}
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.png';
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{
                  textAlign: 'center',
                  fontSize: '11px',
                  color: '#947B62',
                  fontWeight: '500'
                }}>
                  Look {lookIndex + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div style={{
        marginTop: '8px',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center'
      }}>
        {remainingLooks > 0 ? (
          <div style={{ color: '#947B62', fontWeight: '500' }}>
            {remainingLooks} look{remainingLooks !== 1 ? 's' : ''} restante{remainingLooks !== 1 ? 's' : ''} chegando...
          </div>
        ) : (
          <div>✨ Todos os looks gerados • Clique em qualquer look para ver detalhes</div>
        )}
      </div>
    </div>
  );
}