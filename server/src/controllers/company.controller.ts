import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function listCompaniesHandler(req: AuthenticatedRequest, res: Response) {
  // Return list of managed SaaS tenant companies
  return res.json({
    success: true,
    data: [
      {
        id: 'comp-1',
        name: 'Bharat Pay ORM Workspace',
        contactPerson: 'Rahul Sharma',
        email: 'rahul@bharatpay.in',
        phone: '+91 98765 43210',
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        appPackageName: 'com.bharatpay.app',
        appName: 'BharatPay Merchant App',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'comp-2',
        name: 'Zomato Merchant Services',
        contactPerson: 'Anita Kapoor',
        email: 'anita@zomato.com',
        phone: '+91 91234 56789',
        plan: 'PRO',
        status: 'ACTIVE',
        appPackageName: 'com.zomato.merchant',
        appName: 'Zomato Partner',
        createdAt: new Date().toISOString(),
      },
    ],
  });
}

export async function createCompanyHandler(req: AuthenticatedRequest, res: Response) {
  const { name, contactPerson, email, phone, plan, appPackageName } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Company name and email are required.' });
  }

  const newCompany = {
    id: `comp-${Date.now()}`,
    name,
    contactPerson: contactPerson || 'Primary Contact',
    email,
    phone: phone || '',
    plan: plan || 'STARTER',
    status: 'ACTIVE',
    appPackageName: appPackageName || '',
    createdAt: new Date().toISOString(),
  };

  return res.status(201).json({
    success: true,
    data: newCompany,
  });
}

export async function updateCompanyStatusHandler(req: AuthenticatedRequest, res: Response) {
  const { companyId } = req.params;
  const { status } = req.body;

  return res.json({
    success: true,
    data: { companyId, status, updatedAt: new Date().toISOString() },
  });
}
