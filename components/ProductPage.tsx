import React from "react";
import Carousel from "./HeroCarousel";
import { Button } from "./ui/button";
import PricingCards from "./PricingCard";
import ProductCard from "./ProductCard/ProductCard";

const ProductPage = () => {
  return (
    <><div>
      <div className="relative w-full max-w-lg mx-auto mb-6 text-center">
        <p className="text-2xl font-bold">Nom du service</p>
      </div>
      <div>
        <Carousel />
      </div>
      <div>
        <p className="relative text-center mx-10 mt-6 text-sm">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas finibus accumsan lectus, id euismod nibh tempor vitae. Donec elit turpis, suscipit sit amet elit vel, egestas auctor nulla. Sed nec pharetra tellus. Mauris porta mattis nunc at iaculis. Suspendisse potenti. Donec in tincidunt lacus. Maecenas eget efficitur dui. Nulla faucibus commodo tincidunt. Sed dui ipsum, eleifend sed arcu in, aliquet cursus turpis. Sed posuere eros tellus, eu condimentum dolor tincidunt a. Maecenas in aliquet est. Donec vitae lacinia neque. Fusce neque tortor, pretium quis dolor a, dictum dapibus.
        </p>
      </div>
    </div>
    <div className="flex">
      <div className="w-1/2 p-4">
        <p className="text-2xl font-bold relative text-center">Caractéristiques techniques</p>
        <p className="relative text-center mx-10 mt-6 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas finibus accumsan lectus, id euismod nibh tempor vitae. Donec elit turpis, suscipit sit amet elit vel, egestas auctor nulla. Sed nec pharetra tellus. Mauris porta mattis nunc at iaculis. Suspendisse potenti. Donec in tincidunt lacus. Maecenas eget efficitur dui. Nulla faucibus commodo tincidunt. Sed dui ipsum, eleifend sed arcu in, aliquet cursus turpis. Sed posuere eros tellus, eu condimentum dolor tincidunt a. Maecenas in aliquet est. Donec vitae lacinia neque. Fusce neque tortor, pretium quis dolor a, dictum dapibus.</p>
      </div>
      <div className="w-1/2 p-4">
      <p className="text-2xl font-bold relative text-center">Disponible immédiatement</p>
      <Button className="w-full h-full mt-6 text-2xl text-white font-semibold">
        S'abonner maintenant !
      </Button>
      </div>
    </div>
    <div className="mt-20 mx-10"><PricingCards /></div>

    <div className="width-full mx-10">
      <p className="text-2xl font-bold mx-10 mt-6 relative text-center">Services SaaS similaires</p>
      <div className="mx-10 mt-6 flex flex-row"><ProductCard /></div>
    </div>
    </>
  );
};

export default ProductPage;
