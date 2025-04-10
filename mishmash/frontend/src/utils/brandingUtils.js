//This is all chat I have no clue how to do this
export const updateDocumentTitle = (siteName) => {
  if (siteName) {
    document.title = siteName;
  }
};

export const updateFavicon = (logoUrl, fallbackColor) => {
  if (!logoUrl) return;

  const link = document.querySelector("link[rel='icon']") || document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'icon';

  const img = new Image();
  img.crossOrigin = 'Anonymous';
  
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const size = 32; // Standard favicon size
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, size, size);
      
      const scale = Math.min(size / img.width, size / img.height);
      const x = (size - img.width * scale) / 2;
      const y = (size - img.height * scale) / 2;
      
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      link.href = canvas.toDataURL('image/png');
      document.head.appendChild(link);
    } catch (error) {
      console.error('Error generating favicon from logo:', error);
      createColorFavicon(fallbackColor || '#1a237e', link);
    }
  };
  
  img.onerror = () => {
    console.error('Failed to load logo for favicon, using fallback color');
    createColorFavicon(fallbackColor || '#1a237e', link);
  };
  
  img.src = logoUrl;
};

const createColorFavicon = (color, link) => {
  try {
    const canvas = document.createElement('canvas');
    const size = 32;
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = color;
    const radius = 5;
    
    ctx.beginPath();
    ctx.moveTo(size - radius, 0);
    ctx.arcTo(size, 0, size, radius, radius);
    ctx.arcTo(size, size, size - radius, size, radius);
    ctx.arcTo(0, size, 0, size - radius, radius);
    ctx.arcTo(0, 0, radius, 0, radius);
    ctx.closePath();
    ctx.fill();
    
    const domain = window.location.hostname;
    if (domain && domain !== 'localhost') {
      const firstLetter = domain.charAt(0).toUpperCase();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(firstLetter, size / 2, size / 2);
    }
    
    link.href = canvas.toDataURL('image/png');
    document.head.appendChild(link);
  } catch (error) {
    console.error('Error creating color favicon:', error);
  }
};
