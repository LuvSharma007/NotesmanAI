'use client';

import Image from 'next/image';
import { DeepSeek, Meta, Mistral, Moonshot, OpenAI } from '@lobehub/icons';

interface Brand {
  id: string;
  name: string;
  logo: React.ReactNode; 
}

const brands: Brand[] = [
  {
    id: 'brand1',
    name: 'Firecrawl',
    logo: (
      <Image 
        src="/firecrawl.svg" 
        alt="Firecrawl logo" 
        width={28} 
        height={28} 
        className="object-contain" 
      />
    ), 
  },
  {
    id: 'brand2',   
    name: 'BullMQ',
    logo: <Meta size={30}/> 
  },
  {
    id: 'brand3',   
    name: 'Moonshoot',
    logo: <Moonshot size={30} />, 
  },
  {
    id: 'brand4',   
    name: 'Mistral',
    logo: <Mistral size={30} />, 
  },
  {
    id: 'brand5',   
    name: 'DeepSeek',
    logo: <DeepSeek size={30} />, 
  },
  {
    id: 'brand6',   
    name: 'OpenAI',
    logo: <OpenAI size={30} />, 
  },
];

export default function PoweredBy() {
  return (
    <section className="py-12 md:py-16 lg:py-20 px-4">
      <div className="container max-w-6xl mx-auto">
        <p className="text-center text-sm text-muted-foreground mb-8 md:mb-12">
          Powered By Open Source Tools
        </p>

        <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
          {brands.map((brand) => {
            return (
              <div
                key={brand.id}
                className="flex items-center justify-center min-h-[48px]"
              >
                <div className="flex items-center justify-center">
                  {brand.logo}
                </div>
              </div>
            );
          })}
        <span className='text-sm'>And many more</span>  
        </div>
      </div>
    </section>
  );
}
