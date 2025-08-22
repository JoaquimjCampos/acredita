import React from 'react';

export interface AdBannerProps {
  title: string;
  image_url: string;
  link: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ title, image_url, link }) => (
  <a href={link} target="_blank" rel="noopener noreferrer" className="block my-6">
    <div className="rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition">
      <img src={image_url} alt={title} className="w-full h-32 object-cover" />
      <div className="p-2 bg-white text-center font-semibold text-gray-700">{title}</div>
    </div>
  </a>
);
