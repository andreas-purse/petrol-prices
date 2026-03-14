export interface RetailerFeed {
  name: string;
  url: string;
}

export const RETAILER_FEEDS: RetailerFeed[] = [
  {
    name: "Ascona Group",
    url: "https://fuelprices.asconagroup.co.uk/newfuel.json",
  },
  {
    name: "Asda",
    url: "https://storelocator.asda.com/fuel_prices_data.json",
  },
  {
    name: "BP",
    url: "https://www.bp.com/en_gb/united-kingdom/home/fuelprices/fuel_prices_data.json",
  },
  {
    name: "Esso Tesco Alliance",
    url: "https://fuelprices.esso.co.uk/latestdata.json",
  },
  {
    name: "JET",
    url: "https://jetlocal.co.uk/fuel_prices_data.json",
  },
  {
    name: "Karan Retail",
    url: "https://devapi.krlpos.com/integration/live_price/krl",
  },
  {
    name: "Morrisons",
    url: "https://morrisons.com/fuel-prices/fuel.json",
  },
  {
    name: "Moto",
    url: "https://moto-way.com/fuel-price/fuel_prices.json",
  },
  {
    name: "Motor Fuel Group",
    url: "https://fuel.motorfuelgroup.com/fuel_prices_data.json",
  },
  {
    name: "Rontec",
    url: "https://rontec-servicestations.co.uk/fuel-prices/data/fuel_prices_data.json",
  },
  {
    name: "Sainsbury's",
    url: "https://api.sainsburys.co.uk/v1/exports/latest/fuel_prices_data.json",
  },
  {
    name: "SGN",
    url: "https://sgnretail.uk/files/data/SGN_daily_fuel_prices.json",
  },
  {
    name: "Shell",
    url: "https://www.shell.co.uk/fuel-prices-data.html",
  },
  {
    name: "Tesco",
    url: "https://www.tesco.com/fuel_prices/fuel_prices_data.json",
  },
];
