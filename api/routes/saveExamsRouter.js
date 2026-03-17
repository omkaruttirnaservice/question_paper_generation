import { Router } from 'express';
import saveExamsController from '../application/controllers/saveExamsController/saveExamsController.js';

const saveExamsRouter = Router();

/**
 * This will save the answers given by the student in the exam
 * and the students who have given exam
 * It will be called from the exam panel
 */
saveExamsRouter.post('/saveUploadedExam', saveExamsController.saveExamData);

saveExamsRouter.get('/single-candidate-paper', saveExamsController.getCandiateExamPaperInfo);

export default saveExamsRouter;
