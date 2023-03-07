export class ReferenceMetricsDto {
  id: string;
  coordinates: number[];
  shown: boolean;
  description: string;

  constructor(model) {
    this.id = model._id;
    this.coordinates = model.coordinates;
    this.shown = model.shown;
    this.description = model.description;
  }
}
