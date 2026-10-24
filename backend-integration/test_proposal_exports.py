import unittest
from io import BytesIO
from zipfile import ZipFile
from proposal_exports import ProposalExport, Section, generate_docx, generate_pdf

class ExportTests(unittest.TestCase):
    def setUp(self):
        self.p = ProposalExport(id='live-test', client_name='Actual Client', project_title='Actual Project', document_type='RFQ', status='Draft', sections=[Section(id='cover', title='Cover Page', content='Actual Project\nPrepared for Actual Client'), Section(id='exec', title='Executive Summary', content='LATEST EDITED CONTENT')])
    def test_word_contains_latest_sections(self):
        content = generate_docx(self.p)
        with ZipFile(BytesIO(content)) as archive:
            xml = archive.read('word/document.xml').decode()
        self.assertIn('Actual Client', xml)
        self.assertIn('LATEST EDITED CONTENT', xml)
        self.assertNotIn('Meridian', xml)
    def test_pdf_is_a_real_document(self):
        content = generate_pdf(self.p)
        self.assertTrue(content.startswith(b'%PDF-'))
        self.assertGreater(len(content), 1000)
    def test_empty_sections_are_rejected(self):
        self.p.sections[1].content = '  '
        from fastapi import HTTPException
        with self.assertRaises(HTTPException): generate_docx(self.p)

if __name__ == '__main__': unittest.main()
