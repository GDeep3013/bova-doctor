import connectDB from '../../../../db/db';
import ThemeTemplate from '../../../../models/themeTemplate'; // Adjust the path if needed

connectDB();

export async function POST(req) {
  try {
    // Parse the request body
    const { description, doctorType, title } = await req.json();
    if (!['new', 'old'].includes(doctorType)) {
      return new Response(
        JSON.stringify({ message: 'Invalid doctor type.' }),
        { status: 400 }
      );
    }

    if (!title || !description) {
      return new Response(
        JSON.stringify({ message: 'Title and description are required.' }),
        { status: 400 }
      );
    }

    const existingTemplate = await ThemeTemplate.findOne({ doctorType });

    if (existingTemplate) {
      existingTemplate.title = title;
      existingTemplate.description = description;

      const updatedTemplate = await existingTemplate.save();

      return new Response(
        JSON.stringify({
          message: 'Template updated successfully!',
          template: updatedTemplate,
        }),
        { status: 200 }
      );
    } else {
      const newTemplate = new ThemeTemplate({ doctorType, title, description });
      const savedTemplate = await newTemplate.save();
      return new Response(
        JSON.stringify({
          message: 'Template created successfully!',
          template: savedTemplate,
        }),
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    JSON.stringify({ message: 'Server Error', error: error.message }),
    { status: 500 }
    return new Response(
      JSON.stringify({ message: 'Server Error', error: error.message }),
      { status: 500 }
    );
  }
}
