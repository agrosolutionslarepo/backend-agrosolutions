import express from 'express';
import InviteCodesController from '../controllers/inviteCodes.controller';

const router = express.Router();


router.post('/createInviteCode', InviteCodesController.createInviteCodes);
router.delete('/deleteInviteCode', InviteCodesController.disableInviteCodes);
router.post('/checkInviteCode', InviteCodesController.checkInviteCodes);
router.get('/getActiveInviteCode', InviteCodesController.getActiveInviteCode);
router.post('/joinCompanyWithCode', InviteCodesController.joinCompanyWithCode);

export default router;