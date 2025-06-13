import sys
import fitz  # PyMuPDF
import os

def extract_images_from_pdf(pdf_path, output_folder):
    doc = fitz.open(pdf_path)
    os.makedirs(output_folder, exist_ok=True)

    image_paths = []

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        images = page.get_images(full=True)
        for i, img in enumerate(images):
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            if pix.n < 5:
                output_path = os.path.join(output_folder, f"diagram_p{page_num+1}_{i}.png")
                pix.save(output_path)
                image_paths.append(output_path)
            else:
                pix = fitz.Pixmap(fitz.csRGB, pix)
                output_path = os.path.join(output_folder, f"diagram_p{page_num+1}_{i}.png")
                pix.save(output_path)
                image_paths.append(output_path)

    for path in image_paths:
        print(path)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python extract_diagrams.py path_to_pdf")
    else:
        pdf_path = sys.argv[1]
        extract_images_from_pdf(pdf_path, "./diagrams")
