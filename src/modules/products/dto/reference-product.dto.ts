export class ReferenceProductDto {
  id: string;
  name: string;
  picture: string;
  price: number;
  quantity: number;
  category: string;
  shown: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;

  constructor(model) {
    this.id = model._id;
    this.name = model.name;
    this.picture = model.picture;
    this.price = model.price;
    this.quantity = model.quantity;
    this.category = model.category;
    this.shown = model.shown;
    this.description = model.description;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
  }
}
