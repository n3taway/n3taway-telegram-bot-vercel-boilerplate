import { VercelRequest, VercelResponse } from '@vercel/node';

export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  res.status(200).json({
    "code": 200,
    "data": {
      "url": "https://via.placeholder.com/350x150"
    },
    "message": "success"
  })
}