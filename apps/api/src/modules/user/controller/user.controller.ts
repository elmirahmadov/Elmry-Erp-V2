import { Request, Response } from "express";
import { UserService } from "../service/user.service";

const userService = new UserService();

export const createUser = async (req: Request, res: Response) => {
  const result = await userService.create(req.body);
  if (result.status === "SUCCESS") {
    res
      .status(201)
      .json({ message: "Kullanıcı oluşturuldu", user: result.user });
  } else {
    res.status(500).json({ error: result.error });
  }
};

export const findAllUsersByCompany = async (req: Request, res: Response) => {
  const { companyId } = req.params as { companyId: string };
  const result = await userService.findAllByCompany(companyId);
  if (result.status === "SUCCESS") {
    res.json({ users: result.users });
  } else {
    res.status(500).json({ error: result.error });
  }
};

export const findUserById = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await userService.findById(id);
  if (result.status === "SUCCESS") {
    res.json({ user: result.user });
  } else {
    res.status(404).json({ error: result.error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const {
    name,
    email,
    password,
    companyId,
    roleId,
    posBranchId,
    posWarehouseId,
    posTillId,
    posBankId,
  } = req.body;
  const result = await userService.update(parseInt(id), {
    name,
    email,
    password,
    companyId,
    roleId,
    ...(posBranchId !== undefined
      ? { posBranchId: posBranchId ? Number(posBranchId) : null }
      : {}),
    ...(posWarehouseId !== undefined
      ? { posWarehouseId: posWarehouseId ? Number(posWarehouseId) : null }
      : {}),
    ...(posTillId !== undefined
      ? { posTillId: posTillId ? Number(posTillId) : null }
      : {}),
    ...(posBankId !== undefined
      ? { posBankId: posBankId ? Number(posBankId) : null }
      : {}),
  });
  if (result.status === "SUCCESS") {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
};

export const assignPermissionToUser = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { permissionId } = req.body;
  const result = await userService.assignPermission(parseInt(id), permissionId);
  if (result.status === "SUCCESS") {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
};

export const removePermissionFromUser = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { permissionId } = req.body;
  const result = await userService.removePermission(parseInt(id), permissionId);
  if (result.status === "SUCCESS") {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
};

export const getUserPermissions = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await userService.getUserWithPermissions(id);
  if (result.status === "SUCCESS") {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
};
