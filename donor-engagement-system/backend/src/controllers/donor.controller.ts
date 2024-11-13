import { CustomRequest } from 'src/types/custom-request';
import { DonorService } from 'src/service/donor.service';
import { FundraiserService } from '../service/fundraiser.service';
import { Request, Response } from 'express';

export class DonorController {
    constructor(
        private donorService: DonorService,
        private fundraiserService: FundraiserService
    ) {}

    /**
     * @route   GET /api/events/:id/selections/:donorId
     * @desc    Get a donor by ID
     * @param   req.params.id - Event ID
     * @param   req.params.donorId - Donor ID
     * @returns {Object} Donor
     */
    getDonorById = async (req: CustomRequest, res: Response) => {
        const donorId = parseInt(req.params.donorId);
        const donor = await this.donorService.getDonorById(donorId);
    }
    
    /**
     * @route   GET /api/events/:id/selections
     * @desc    Get all donors associated with a specific event and fundraiser
     * @param   req.params.id - Event ID
     * @returns {Array} List of donors
     */
    getDonorsByEventFundraiser = async (req: CustomRequest, res: Response) => {
        const eventId = parseInt(req.params.id);
        const accountId = (req as CustomRequest).user?.id;

        if (!accountId) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        const fundraiserId = await this.fundraiserService.getFundraiserIdByAccountId(accountId);
        const donors = await this.donorService.getDonorsByEventFundraiser(eventId, fundraiserId);
        console.log('Donors fetched successfully');
        res.json({
            success: true,
            data: donors
        });
    }

    /**
     * @route   POST /api/events/:id/selections/save
     * @desc    Save selections
     */
    saveSelections = async (req: CustomRequest, res: Response) => {
        try {
            console.log('DonorController: Received save request:', {
                params: req.params,
                body: req.body,
                user: req.user
            });
            
            const eventId = parseInt(req.params.id);
            const { donorIds } = req.body;
            const accountId = req.user?.id;

            if (!accountId) {
                console.log('DonorController: No account ID found');
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }

            if (!donorIds || !Array.isArray(donorIds)) {
                console.log('DonorController: Invalid donorIds:', donorIds);
                return res.status(400).json({
                    success: false,
                    error: 'Invalid donor selection'
                });
            }

            await this.donorService.saveSelections(eventId, donorIds, accountId);
            console.log('DonorController: Save successful');
            res.json({ success: true });
        } catch (error) {
            console.error('DonorController: Error saving selections:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to save selections'
            });
        }
    }

    /**
     * @route   POST /api/events/:id/selections/confirm
     * @desc    Confirm selections
     */
    confirmSelections = async (req: CustomRequest, res: Response) => {
        try {
            const eventId = parseInt(req.params.id);
            const { donorIds } = req.body;
            const accountId = req.user?.id;

            if (!accountId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }

            await this.donorService.confirmSelections(eventId, donorIds, accountId);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to confirm selections'
            });
        }
    }
    
}
