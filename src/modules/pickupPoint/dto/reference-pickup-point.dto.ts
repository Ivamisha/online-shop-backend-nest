export class ReferencePickupPointDto {
  id: string;
  address: string;
  coordinates: number[];
  workingHours: string;
  shown: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;

  constructor(model) {
    this.id = model._id;
    this.address = model.address;
    this.coordinates = model.coordinates;
    this.workingHours = model.workingHours;
    this.shown = model.shown;
    this.description = model.description;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
  }
}
