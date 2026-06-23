import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('resumePortal');
        const companies = await db.collection('companyData').find({}).toArray();
        
        
        const transformedCompanies = companies.map(company => ({
            _id: company._id,
            name: company.company_name || company.name,
            jobTitle: company.job_title || company.jobTitle,
            location: company.location,
            skills: company.required_skills || company.skills || [],
            experienceLevel: company.experience_required || company.experienceLevel,
            email: company.email || company.contact_email,
            
            createdAt: company.createdAt,
            postedOn: company.postedAt
        }));

        return NextResponse.json(transformedCompanies);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
    }
}