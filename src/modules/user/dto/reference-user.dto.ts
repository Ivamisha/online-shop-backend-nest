import mongoose from 'mongoose';

export class ReferenceUserDto {
  id: string;
  name: string;
  userAvatar: string;
  surname: string;
  email: string;
  address: string;
  phoneNumber: string;
  isAdmin: boolean;
  favorites: string[] | [];
  shoppingCart: string[] | [];

  constructor(model) {
    this.id = model._id;
    this.name = model.name;
    this.userAvatar = model.userAvatar;
    this.surname = model.surname;
    this.email = model.email;
    this.address = model.address;
    this.phoneNumber = model.phoneNumber;
    this.isAdmin = model.isAdmin;
    this.favorites = model.favorites;
    this.shoppingCart = model.shoppingCart;
  }
}
