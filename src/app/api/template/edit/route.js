import connectDB from '../../../../db/db';
import ThemeTemplate from '../../../../models/themeTemplate'; // Adjust the path if needed

connectDB();

export async function GET(req) {
  try {
 
    const templates = await ThemeTemplate.find({});     
    const newDoctorTemplates = templates.filter(template => template?.doctorType === 'new');
    const oldDoctorTemplates = templates.filter(template => template?.doctorType === 'old');

    // Create response object with both new and old doctor templates
    const response = {
      newDoctorTemplates,
      oldDoctorTemplates,
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching templates:', error);
    return new Response(
      JSON.stringify({ message: 'Server Error', error: error.message }),
      { status: 500 }
    );
  }
}