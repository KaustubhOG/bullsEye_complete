import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { BullseyeClient } from '@/lib/solana/bullseye-client';
import { getRpcEndpoint, NETWORK, VERIFIERS, PROGRAM_ID } from '@/lib/solana/config';
import { deriveGoalPda, deriveVerificationPda, deriveGoalCounterPda } from '@/lib/solana/utils';
import * as anchor from '@coral-xyz/anchor';
import IDL from '@/lib/solana/idl/bullseye.json';

// ✅ FIXED: Added required Solana Action headers
const ACTIONS_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Encoding, Accept-Encoding',
  'Content-Type': 'application/json',
  'X-Action-Version': '2.0',
  'X-Blockchain-Ids': 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  'ngrok-skip-browser-warning': 'true',
};

// Get base URL from environment or request
function getBaseUrl(req: NextRequest): string {
  // Always use the request host - this will be the current deployment URL
  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  return `${protocol}://${host}`;
}

// OPTIONS - CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { 
    status: 200,
    headers: ACTIONS_CORS_HEADERS 
  });
}

// GET - Returns the Blink metadata
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ goalOwner: string }> }
) {
  try {
    const { goalOwner } = await context.params;
    
    console.log('🔍 Blink GET request for:', goalOwner);
    
    const baseUrl = getBaseUrl(req);
    console.log('📍 Base URL:', baseUrl);
    
    // Try to fetch goal data
    const client = new BullseyeClient();
    let goalData;
    
    try {
      goalData = await client.getGoal(goalOwner);
      console.log('📊 Goal data:', goalData);
    } catch (error) {
      console.log('⚠️ Could not fetch goal data:', error);
    }
    
    // Build response
    const response = {
      icon: `${baseUrl}/preview.png`,  
      image: `${baseUrl}/preview.png`,
      title: `Vote on Goal`,
      description: goalData 
        ? `Vote YES or NO on this goal.\n\n📝 ${goalData.title}\n💰 Stake: ${goalData.amountSol.toFixed(2)} SOL\n\nGoal Owner: ${goalOwner.slice(0, 8)}...`
        : `Vote YES or NO on this goal.\n\n💰 Stake: 0.1 SOL\n\nGoal Owner: ${goalOwner.slice(0, 8)}...`,
      label: 'Vote',
      links: {
        actions: [
          {
            label: '✅ Vote YES',
            href: `${baseUrl}/api/actions/vote/${goalOwner}?vote=yes`,
          },
          {
            label: '❌ Vote NO',
            href: `${baseUrl}/api/actions/vote/${goalOwner}?vote=no`,
          },
        ],
      },
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: ACTIONS_CORS_HEADERS 
    });
  } catch (error: any) {
    console.error('❌ Blink GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch goal data' },
      { 
        status: 500,
        headers: ACTIONS_CORS_HEADERS 
      }
    );
  }
}

// POST - Handles the vote transaction building
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ goalOwner: string }> }
) {
  try {
    const { goalOwner } = await context.params;
    const { searchParams } = new URL(req.url);
    const vote = searchParams.get('vote');
    
    // Get account (verifier wallet) from request body
    const body = await req.json();
    const { account } = body;
    
    if (!account) {
      return NextResponse.json(
        { error: 'Missing account in request body' },
        { 
          status: 400,
          headers: ACTIONS_CORS_HEADERS 
        }
      );
    }
    
    console.log('🗳️ Blink POST request:', { 
      goalOwner, 
      vote, 
      verifier: account 
    });
    
    // Convert vote to boolean
    const voteBoolean = vote === 'yes';
    
    // Connect to Solana
    const connection = new Connection(getRpcEndpoint(NETWORK), 'confirmed');
    const verifierPubkey = new PublicKey(account);
    const goalOwnerPubkey = new PublicKey(goalOwner);
    
    // ✅ UPDATED: Get goal counter to find active goal number
    const client = new BullseyeClient();
    const goalCounter = await client.getGoalCounter(goalOwnerPubkey);
    
    if (!goalCounter || goalCounter.activeGoal === null) {
      return NextResponse.json(
        { error: 'No active goal found for this user' },
        { 
          status: 400,
          headers: ACTIONS_CORS_HEADERS 
        }
      );
    }
    
    const goalNumber = goalCounter.activeGoal;
    
    // ✅ UPDATED: Use goal number in PDA derivation
    const [goalPda] = deriveGoalPda(goalOwnerPubkey, goalNumber);
    const [verificationPda] = deriveVerificationPda(goalPda);
    
    console.log('📍 Goal PDA:', goalPda.toBase58());
    console.log('📍 Verification PDA:', verificationPda.toBase58());
    console.log('📍 Goal Number:', goalNumber);
    
    // ✅ FIXED: Build transaction directly using Anchor
    const provider = new anchor.AnchorProvider(
      connection,
      { 
        publicKey: verifierPubkey,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs,
      } as any,
      { commitment: 'confirmed' }
    );
    
    const program = new anchor.Program(IDL as any, provider);
    
    // Build vote instruction
    const ix = await program.methods
      .castVote(voteBoolean)
      .accounts({
        goal: goalPda,
        verification: verificationPda,
        verifier: verifierPubkey,
      })
      .instruction();
    
    // Create transaction
    const tx = new anchor.web3.Transaction();
    tx.add(ix);
    tx.feePayer = verifierPubkey;
    
    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    
    // Serialize transaction
    const serializedTx = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    
    // Return transaction for wallet to sign
    const response = {
      transaction: serializedTx.toString('base64'),
      message: vote === 'yes' 
        ? '✅ Voting YES on this goal' 
        : '❌ Voting NO on this goal',
    };
    
    console.log('✅ Transaction built successfully');
    
    return NextResponse.json(response, { 
      status: 200,
      headers: ACTIONS_CORS_HEADERS 
    });
    
  } catch (error: any) {
    console.error('❌ Blink POST error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process vote',
        details: error.toString() 
      },
      { 
        status: 500,
        headers: ACTIONS_CORS_HEADERS 
      }
    );
  }
}