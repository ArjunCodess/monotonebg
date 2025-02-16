# MonotoneBG
A Next.js application that allows users to upload an image, remove its background, and apply grayscale, brightness, contrast, and blur adjustments to create monotone background designs.

## Features
* **Background Removal:**  Uses the `@imgly/background-removal` library to efficiently remove image backgrounds.
* **Image Adjustments:**  Provides sliders for adjusting grayscale, brightness, contrast, and blur.
* **Drag and Drop Support:** Allows users to drag and drop images directly onto the upload area.
* **Download Functionality:** Enables users to download the processed image.
* **Responsive Design:** Adapts to different screen sizes for optimal user experience.

## Usage
1. Upload an image either by dragging and dropping it onto the designated area or by selecting it using the file chooser.
2. Adjust the grayscale, brightness, contrast, and blur values using the provided sliders.
3. The processed image will be displayed in real-time.
4. Once you are satisfied with the result, click the "Download" button to save the image to your computer.

## Installation
This project is a Next.js application. To run it locally:

1. Clone the repository:  `git clone https://github.com/ArjunCodess/monotonebg.git`
2. Navigate to the project directory: `cd monotone-bg`
3. Install dependencies: `npm install` or `yarn install`
4. Start the development server: `npm run dev` or `yarn dev`

## Technologies Used
* **Next.js:** A React framework for building user interfaces and serverless functions. Used for building the frontend and backend of this application.
* **React:** A JavaScript library for building user interfaces. Used for building the interactive components of the application.
* **TypeScript:** A superset of JavaScript that adds static typing. Improves code maintainability and reduces errors.
* **@imgly/background-removal:** A library for removing backgrounds from images.  Provides the core functionality for background removal.
* **Tailwind CSS:** A utility-first CSS framework.  Provides styling and theming for the components.
* **Radix UI:**  Provides accessible UI components. Used for building the button and slider components.
* **Class Variance Authority (cva):** Utility for creating styled components in React. Provides varient props for button styling.
* **Lucide React:**  Icon library for UI components. Used to display icons within the application.
* **clsx:** Utility for combining class names. Used to simplify class management.
* **tailwind-merge:** A library used to merge tailwind classes. Used to simplify class management.

## Configuration
No specific configuration is required beyond the standard Next.js setup. The application uses environment variables for any sensitive data (if needed).

## API Documentation
The application uses a serverless function (`/api/process-image`) to handle image processing.  The API accepts a `FormData` object containing an `image` file.  The response is a base64 encoded PNG image data URL.


**Request:**

```
POST /api/process-image
Content-Type: multipart/form-data

image: <image file>
```

**Response:**

```json
"data:image/png;base64,<base64 encoded image data>"
```

## Dependencies
The project dependencies are listed in `package.json`.  They can be installed using `npm install` or `yarn install`.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## Testing
No dedicated testing suite is currently implemented, however, thorough testing may be added in future releases.

*README.md was made with [Etchr](https://etchr.dev)*