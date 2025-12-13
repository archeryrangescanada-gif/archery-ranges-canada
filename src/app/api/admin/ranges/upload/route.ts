import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { parseRangesCSV, validateParsedRange } from '@/lib/csv-parser';
import { importRanges, previewImport } from '@/lib/range-importer';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max for processing large CSVs

/**
 * POST /api/admin/ranges/upload
 * Upload and process a CSV file of ranges
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and has admin privileges
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role check once user roles are implemented
    // For now, any authenticated user can upload (you may want to restrict this)

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const updateExisting = formData.get('updateExisting') === 'true';
    const previewOnly = formData.get('previewOnly') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a CSV file.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse CSV
    const parseResult = await parseRangesCSV(buffer);

    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json(
        {
          error: 'Failed to parse CSV',
          details: parseResult.errors,
          stats: parseResult.stats,
        },
        { status: 400 }
      );
    }

    // Validate all parsed ranges
    const validRanges = [];
    const validationErrors = [];

    for (const range of parseResult.data) {
      const validation = validateParsedRange(range);
      if (validation.valid) {
        validRanges.push(range);
      } else {
        validationErrors.push({
          range: range.name,
          errors: validation.errors,
        });
      }
    }

    // If preview only, return preview data
    if (previewOnly) {
      const preview = await previewImport(supabase, validRanges);

      return NextResponse.json({
        success: true,
        isPreview: true,
        stats: {
          totalRows: parseResult.stats?.total || 0,
          parsed: parseResult.stats?.parsed || 0,
          valid: validRanges.length,
          invalid: validationErrors.length,
          newRanges: preview.newRanges.length,
          existingRanges: preview.existingRanges.length,
          newCities: preview.newCities.length,
          newProvinces: preview.newProvinces.length,
        },
        preview: {
          newRanges: preview.newRanges.slice(0, 10), // Show first 10
          existingRanges: preview.existingRanges.slice(0, 10),
          newCities: preview.newCities,
          newProvinces: preview.newProvinces,
        },
        parseErrors: parseResult.errors,
        validationErrors,
      });
    }

    // Import ranges
    const importResult = await importRanges(supabase, validRanges, {
      updateExisting,
      skipInvalid: true,
    });

    return NextResponse.json({
      success: importResult.success,
      stats: {
        totalRows: parseResult.stats?.total || 0,
        parsed: parseResult.stats?.parsed || 0,
        valid: validRanges.length,
        invalid: validationErrors.length,
        inserted: importResult.inserted,
        updated: importResult.updated,
        failed: importResult.failed,
      },
      parseErrors: parseResult.errors,
      validationErrors,
      importErrors: importResult.errors,
    });
  } catch (error) {
    console.error('CSV upload error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/ranges/upload
 * Get upload status or stats
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total ranges count by province
    const { data: provinces } = await supabase.from('provinces').select('id, name, slug');

    const stats = [];

    if (provinces) {
      for (const province of provinces) {
        const { count } = await supabase
          .from('ranges')
          .select('*', { count: 'exact', head: true })
          .eq('province_id', province.id);

        stats.push({
          province: province.name,
          slug: province.slug,
          count: count || 0,
        });
      }
    }

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('CSV stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
