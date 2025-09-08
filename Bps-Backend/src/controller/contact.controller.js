import { Contact } from "../model/contact.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const createContact = asyncHandler(async (req, res) => {
  const { name, contactNumber, email, address } = req.body;

  if ([name, contactNumber, email, address].some(field => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existingContact = await Contact.findOne({ contactNumber });
  if (existingContact) {
    throw new ApiError(409, "Contact with this number already exists");
  }

  const contact = await Contact.create({ name, contactNumber, email, address,createdBy: req.user._id });

  return res.status(201).json(new ApiResponse(201, "Contact created successfully", contact));
});


export const getAllContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find(req.roleQueryFilter).sort({ createdAt: -1 });

  const contactList = contacts.map((contact, index) => ({
    sNo: index + 1,
    contactNumber: contact.contactNumber,
    name: contact.name,
    email: contact.email,
    address: contact.address,
  }));

  return res.status(200).json(new ApiResponse(200, "All contacts fetched", contactList));
});


export const getContactByNumber = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({ contactNumber: req.params.contactNumber });
  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }
  return res.status(200).json(new ApiResponse(200, "Contact found", contact));
});


export const updateContactByNumber = asyncHandler(async (req, res) => {
  const updated = await Contact.findOneAndUpdate(
    { contactNumber: req.params.contactNumber },
    req.body,
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new ApiError(404, "Contact not found");
  }

  return res.status(200).json(new ApiResponse(200, "Contact updated successfully", updated));
});


export const deleteContactByNumber = asyncHandler(async (req, res) => {
  const deleted = await Contact.findOneAndDelete({ contactNumber: req.params.contactNumber });

  if (!deleted) {
    throw new ApiError(404, "Contact not found");
  }

  return res.status(200).json(new ApiResponse(200, "Contact deleted successfully"));
});
