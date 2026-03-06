export interface ResolutionPlace {
  name: string;
  address?: string;
}

export interface Violation {
  licensePlate: string;
  plateColor: string;
  vehicleType: string;
  violationTime: string;
  violationLocation: string;
  violationBehavior: string;
  status: string;
  detectionUnit: string;
  resolutionPlaces: ResolutionPlace[];
}
