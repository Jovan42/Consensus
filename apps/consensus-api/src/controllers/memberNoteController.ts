import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { MemberNote } from '../entities/MemberNote';
import { Member } from '../entities/Member';
import { Round } from '../entities/Round';
import { CreateMemberNoteDto, UpdateMemberNoteDto, MemberNoteResponseDto } from '../dto/MemberNoteDto';
import { validate } from 'class-validator';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getMemberNoteByRound = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { roundId } = req.params;
  const userEmail = req.user?.email;

  if (!userEmail) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  // Find the member for this user
  const memberRepository = AppDataSource.getRepository(Member);
  const member = await memberRepository.findOne({
    where: { email: userEmail }
  });

  if (!member) {
    res.status(404).json({ error: 'Member not found' });
    return;
  }

  // Verify the round exists and member is part of the club
  const roundRepository = AppDataSource.getRepository(Round);
  const round = await roundRepository.findOne({
    where: { id: roundId },
    relations: ['club', 'club.members']
  });

  if (!round) {
    res.status(404).json({ error: 'Round not found' });
    return;
  }

  // Check if member is part of the club
  const isMemberOfClub = round.club.members.some(m => m.id === member.id);
  if (!isMemberOfClub) {
    res.status(403).json({ error: 'You are not a member of this club' });
    return;
  }

  // Find or create the note
  const noteRepository = AppDataSource.getRepository(MemberNote);
  let note = await noteRepository.findOne({
    where: {
      member: { id: member.id },
      round: { id: roundId }
    },
    relations: ['member', 'round']
  });

  if (!note) {
    // Create a new note
    note = noteRepository.create({
      member: member,
      round: round,
      title: null,
      content: null
    });
    await noteRepository.save(note);
  }

  res.json(new MemberNoteResponseDto(note));
});

export const updateMemberNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { noteId } = req.params;
  const userEmail = req.user?.email;
  const updateData: UpdateMemberNoteDto = req.body;

  if (!userEmail) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  // Validate the update data
  const dto = new UpdateMemberNoteDto();
  Object.assign(dto, updateData);
  const errors = await validate(dto);

  if (errors.length > 0) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.map(e => e.constraints) 
    });
    return;
  }

  // Find the member for this user
  const memberRepository = AppDataSource.getRepository(Member);
  const member = await memberRepository.findOne({
    where: { email: userEmail }
  });

  if (!member) {
    res.status(404).json({ error: 'Member not found' });
    return;
  }

  // Find the note and verify ownership
  const noteRepository = AppDataSource.getRepository(MemberNote);
  const note = await noteRepository.findOne({
    where: { id: noteId },
    relations: ['member']
  });

  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  if (!note.canAccess(member.id)) {
    res.status(403).json({ error: 'You can only edit your own notes' });
    return;
  }

  // Update the note
  Object.assign(note, updateData);
  await noteRepository.save(note);

  res.json(new MemberNoteResponseDto(note));
});

export const getAllMemberNotes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  // Find the member for this user
  const memberRepository = AppDataSource.getRepository(Member);
  const member = await memberRepository.findOne({
    where: { email: userEmail }
  });

  if (!member) {
    res.status(404).json({ error: 'Member not found' });
    return;
  }

  // Get all notes for this member
  const noteRepository = AppDataSource.getRepository(MemberNote);
  const notes = await noteRepository.find({
    where: { member: { id: member.id } },
    relations: ['round', 'round.club'],
    order: { updatedAt: 'DESC' }
  });

  const response = notes.map(note => ({
    id: note.id,
    title: note.title,
    content: note.content,
    roundId: note.round.id,
    roundTitle: `Round ${note.round.id.slice(0, 8)}`,
    clubName: note.round.club.name,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  }));

  res.json(response);
});

export const deleteMemberNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { noteId } = req.params;
  const userEmail = req.user?.email;

  if (!userEmail) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  // Find the member for this user
  const memberRepository = AppDataSource.getRepository(Member);
  const member = await memberRepository.findOne({
    where: { email: userEmail }
  });

  if (!member) {
    res.status(404).json({ error: 'Member not found' });
    return;
  }

  // Find the note and verify ownership
  const noteRepository = AppDataSource.getRepository(MemberNote);
  const note = await noteRepository.findOne({
    where: { id: noteId },
    relations: ['member']
  });

  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  if (!note.canAccess(member.id)) {
    res.status(403).json({ error: 'You can only delete your own notes' });
    return;
  }

  // Delete the note
  await noteRepository.remove(note);

  res.json({ message: 'Note deleted successfully' });
});