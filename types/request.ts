export interface CarDriver {
    id: string;
    name: string;
    document?: string;
    email?: string;
  }
  
  export interface CarRental {
    id: string;
    startDate: string;
    endDate: string;
    drivers: CarDriver[];
    observations: string;
  }
  
  export interface HotelGuest {
    id: string;
    name: string;
    document?: string;
  }