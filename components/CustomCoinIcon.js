import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export default function CustomCoinIcon({ size = 50, coinColor = "#DAA520", seedColor = "#A0522D" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* המטבע */}
      <Circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill={coinColor} 
        stroke="#B8860B" 
        strokeWidth="4" 
      />
      {/* "זרע" – צורה מעוגלת (אלפטית) גדולה יותר */}
      <Path 
        d="M50,35 
           C38,38, 38,62, 50,65 
           C62,62, 68,50, 60,45 
           C55,40, 50,35, 50,35 Z"
        fill={seedColor}
      />
    </Svg>
  );
}
