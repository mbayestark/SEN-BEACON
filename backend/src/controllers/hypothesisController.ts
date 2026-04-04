import { Request, Response } from 'express';
import Hypothesis from '../models/Hypothesis';

export const getAllHypotheses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, area_name, disease, min_confidence } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (area_name) filter.area_name = area_name;
    if (disease) filter.related_data_sources = disease;
    if (min_confidence) filter.confidence_score = { $gte: parseFloat(min_confidence as string) };

    const hypotheses = await Hypothesis.find(filter)
      .sort({ created_at: -1 })
      .populate('evaluated_by', 'username email role');

    res.status(200).json({
      success: true,
      count: hypotheses.length,
      data: hypotheses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hypotheses',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getHypothesisById = async (req: Request, res: Response): Promise<void> => {
  try {
    const hypothesis = await Hypothesis.findById(req.params.id)
      .populate('evaluated_by', 'username email role');

    if (!hypothesis) {
      res.status(404).json({
        success: false,
        message: 'Hypothesis not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: hypothesis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hypothesis',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const evaluateHypothesis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, notes } = req.body;

    if (!status || !['accepted', 'refuted'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Status must be either "accepted" or "refuted"'
      });
      return;
    }

    const hypothesis = await Hypothesis.findById(req.params.id);

    if (!hypothesis) {
      res.status(404).json({
        success: false,
        message: 'Hypothesis not found'
      });
      return;
    }

    hypothesis.status = status;
    hypothesis.evaluated_at = new Date();
    hypothesis.evaluated_by = req.session.userId as any;
    if (notes) hypothesis.evaluation_notes = notes;

    await hypothesis.save();

    const updatedHypothesis = await Hypothesis.findById(hypothesis._id)
      .populate('evaluated_by', 'username email role');

    res.status(200).json({
      success: true,
      message: `Hypothesis ${status} successfully`,
      data: updatedHypothesis
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error evaluating hypothesis',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getHypothesisStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalHypotheses = await Hypothesis.countDocuments();
    const pendingHypotheses = await Hypothesis.countDocuments({ status: 'pending' });
    const acceptedHypotheses = await Hypothesis.countDocuments({ status: 'accepted' });
    const refutedHypotheses = await Hypothesis.countDocuments({ status: 'refuted' });

    const accuracyRate = totalHypotheses > 0 
      ? ((acceptedHypotheses / (acceptedHypotheses + refutedHypotheses)) * 100) || 0
      : 0;

    const avgConfidenceByStatus = await Hypothesis.aggregate([
      {
        $group: {
          _id: '$status',
          avg_confidence: { $avg: '$confidence_score' },
          count: { $sum: 1 }
        }
      }
    ]);

    const byDataSource = await Hypothesis.aggregate([
      { $unwind: '$related_data_sources' },
      {
        $group: {
          _id: '$related_data_sources',
          count: { $sum: 1 },
          accepted: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          },
          refuted: {
            $sum: { $cond: [{ $eq: ['$status', 'refuted'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalHypotheses,
        pending: pendingHypotheses,
        accepted: acceptedHypotheses,
        refuted: refutedHypotheses,
        accuracy_rate: accuracyRate.toFixed(2),
        by_status: avgConfidenceByStatus,
        by_data_source: byDataSource
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating hypothesis stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
