import { CompanyRepository } from "../repository/company.repository";
import { CompanySetupDto, CompanyUpdateDto } from "../dto/company.dto";

const companyRepository = new CompanyRepository();

export class CompanyService {
  async setup(data: CompanySetupDto) {
    try {
      const name = data.name?.trim();
      const ownerName = data.ownerName?.trim();
      const ownerSurname = data.ownerSurname?.trim();
      const phone = data.phone?.trim();
      const extraPhone = data.extraPhone?.trim() || null;
      const email = data.email?.trim() || null;
      const imageUrl = data.imageUrl?.trim() || null;

      if (!name || !ownerName || !ownerSurname || !phone || !data.birthDate) {
        return { status: "ERROR", error: "Tum zorunlu alanlar doldurulmali" };
      }

      const existingByName = await companyRepository.findByName(name);
      if (existingByName) {
        return { status: "ERROR", error: "Bu sirket adi zaten kullaniliyor" };
      }

      const existingByPhone = await companyRepository.findByPhone(phone);
      if (existingByPhone) {
        return { status: "ERROR", error: "Bu telefon zaten kayitli" };
      }

      const company = await companyRepository.create({
        name,
        ownerName,
        ownerSurname,
        birthDate: data.birthDate,
        phone,
        extraPhone,
        email,
        imageUrl,
      });

      return { status: "SUCCESS", company };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async update(id: string, data: CompanyUpdateDto) {
    try {
      const parsedId = Number(id);
      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return { status: "ERROR", error: "Gecersiz sirket ID" };
      }

      const existing = await companyRepository.findById(parsedId);
      if (!existing) {
        return { status: "ERROR", error: "Sirket bulunamadi" };
      }

      const payload: Record<string, unknown> = {};
      if (data.name !== undefined) payload.name = data.name.trim();
      if (data.ownerName !== undefined) payload.ownerName = data.ownerName.trim();
      if (data.ownerSurname !== undefined)
        payload.ownerSurname = data.ownerSurname.trim();
      if (data.birthDate !== undefined) payload.birthDate = data.birthDate;
      if (data.phone !== undefined) payload.phone = data.phone.trim();
      if (data.extraPhone !== undefined)
        payload.extraPhone = data.extraPhone?.trim() || null;
      if (data.email !== undefined) payload.email = data.email?.trim() || null;
      if (data.imageUrl !== undefined)
        payload.imageUrl = data.imageUrl?.trim() || null;

      if (payload.name && payload.name !== existing.name) {
        const byName = await companyRepository.findByName(String(payload.name));
        if (byName) {
          return { status: "ERROR", error: "Bu sirket adi zaten kullaniliyor" };
        }
      }

      if (payload.phone && payload.phone !== existing.phone) {
        const byPhone = await companyRepository.findByPhone(
          String(payload.phone),
        );
        if (byPhone) {
          return { status: "ERROR", error: "Bu telefon zaten kayitli" };
        }
      }

      const company = await companyRepository.update(parsedId, payload);
      return { status: "SUCCESS", company };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findAll() {
    try {
      const companies = await companyRepository.findAll();
      return { status: "SUCCESS", companies };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findById(id: string) {
    try {
      const company = await companyRepository.findById(id);
      if (!company) {
        return { status: "ERROR", error: "Sirket bulunamadi" };
      }
      return { status: "SUCCESS", company };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }
}
