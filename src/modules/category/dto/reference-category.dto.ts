import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../category.model';

export class ReferenceCategoryDto {
  id: string;
  title: string;
  description: string;
  shown: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(model) {
    this.id = model._id;
    this.title = model.title;
    this.description = model.description;
    this.shown = model.shown;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
  }
}
