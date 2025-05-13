import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { CompanyService } from '../company.service';
import { Company } from '../company.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CompanyInputDto } from '../dto/company-input.dto';
import { validate } from 'class-validator';

const mockEntityManager = {
  create: jest.fn((entity, data) => Object.assign(new entity(), data)),
  persistAndFlush: jest.fn().mockResolvedValue(undefined),
  findOne: jest.fn().mockResolvedValue(null),
  findAll: jest.fn().mockResolvedValue([]),
  assign: jest.fn(),
  flush: jest.fn().mockResolvedValue(undefined),
  removeAndFlush: jest.fn().mockResolvedValue(undefined),
  find: jest.fn().mockResolvedValue([]),
};

describe('CompanyService', () => {
  let service: CompanyService;
  let em: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: EntityManager, useValue: mockEntityManager },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    em = module.get<EntityManager>(EntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a company successfully', async () => {
    const companyData: CompanyInputDto = {
      name: 'Test Company',
      email: 'test@example.com',
      phoneNumber: '123456789',
      description:
        'ИнвестБГ Груп е динамична инвестиционна компания, специализирана в развитието на недвижими имоти с висок потенциал. С фокус върху устойчивост и иновации, компанията работи в тясно сътрудничество с местни общности и партньори, за да създава проекти, които обогатяват градската среда и носят стойност на инвеститорите.',
      website: 'https://test.com',
      resources: {
        logoImage: 'https://example.com/logo.jpg',
        galleryImage: 'https://example.com/gallery1.jpg',
      },
    };

    const createdCompany = new Company();
    Object.assign(createdCompany, companyData);

    mockEntityManager.create.mockImplementation((entity, data) =>
      Object.assign(new entity(), data),
    );
    mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

    await expect(service.create(companyData)).resolves.toMatchObject({
      name: 'Test Company',
      email: 'test@example.com',
      phoneNumber: '123456789',
      description:
        'ИнвестБГ Груп е динамична инвестиционна компания, специализирана в развитието на недвижими имоти с висок потенциал. С фокус върху устойчивост и иновации, компанията работи в тясно сътрудничество с местни общности и партньори, за да създава проекти, които обогатяват градската среда и носят стойност на инвеститорите.',
      website: 'https://test.com',
      resources: {
        logoImage: 'https://example.com/logo.jpg',
        galleryImage: 'https://example.com/gallery1.jpg',
      },
    });
  });

  it('should throw BadRequestException if company data is invalid', async () => {
    const invalidCompanyData: CompanyInputDto = {
      name: '',
      email: '',
      phoneNumber: '',
      description: '',
      website: '',
      resources: {
        logoImage: '',
        galleryImage: '',
      },
    };

    await expect(service.create(invalidCompanyData)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should return a company by ID', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    const company = new Company();

    mockEntityManager.findOne.mockResolvedValue(company);
    await expect(service.getCompanyById(id)).resolves.toEqual(company);
  });

  it('should throw NotFoundException if company does not exist', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    mockEntityManager.findOne.mockResolvedValue(null);
    mockEntityManager.assign.mockReturnValue(null);

    await expect(
      service.update(id, { name: 'Updated Company' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return all companies', async () => {
    const companies = [
      Object.assign(new Company(), {
        id: '9a70778c-873a-4b34-85ed-54df8ac42ba9',
      }),
      Object.assign(new Company(), {
        id: 'eda21d45-15e0-4107-ae2d-4a58209160e6',
      }),
    ];

    mockEntityManager.findAll.mockResolvedValue(companies);
    (em.find as jest.Mock).mockResolvedValue(companies);

    await expect(service.getAllCompanies()).resolves.toEqual(companies);
  });

  it('should delete a company successfully', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    const existingCompany = new Company();

    mockEntityManager.findOne.mockResolvedValue(existingCompany);
    mockEntityManager.removeAndFlush.mockResolvedValue(undefined);

    await expect(service.delete(id)).resolves.toBeUndefined();
  });

  it('should throw NotFoundException when deleting a non-existent company', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    (em.findOne as jest.Mock).mockImplementation(() => Promise.resolve(null));

    await expect(service.delete(id)).rejects.toThrow(NotFoundException);
  });
});
