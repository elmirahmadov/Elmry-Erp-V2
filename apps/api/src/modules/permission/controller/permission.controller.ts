import { Request, Response } from "express";
import { PermissionService } from "../service/permission.service";

const permissionService = new PermissionService();

export const createPermission = async (req: Request, res: Response) => {
  const result = await permissionService.create(req.body);
  if (result.status === "SUCCESS") {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
};

export const getAllPermissions = async (req: Request, res: Response) => {
  const result = await permissionService.findAll();
  if (result.status === "SUCCESS") {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
};

export const getPermissionById = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await permissionService.findById(parseInt(id));
  if (result.status === "SUCCESS") {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
};
