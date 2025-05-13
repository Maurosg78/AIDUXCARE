import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import type { Session } from 'next-auth';

interface PubMedResult {
  title: string;
  year: number;
  source: string;
  url: string;
  abstract: string | undefined;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const session = await getServerSession(req, res, authOptions) as Session | null;
    if (!session?.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: 'Query requerida' });
    }

    // Paso 1: Buscar IDs de artículos
    const searchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
    searchUrl.searchParams.append('db', 'pubmed');
    searchUrl.searchParams.append('term', query);
    searchUrl.searchParams.append('retmode', 'json');
    searchUrl.searchParams.append('retmax', '3');
    searchUrl.searchParams.append('sort', 'relevance');
    searchUrl.searchParams.append('api_key', process.env.PUBMED_API_KEY || '');

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();
    const pmids = searchData.esearchresult.idlist;

    if (!pmids || pmids.length === 0) {
      return res.status(200).json({ results: [] });
    }

    // Paso 2: Obtener detalles de los artículos
    const fetchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi');
    fetchUrl.searchParams.append('db', 'pubmed');
    fetchUrl.searchParams.append('id', pmids.join(','));
    fetchUrl.searchParams.append('retmode', 'xml');
    fetchUrl.searchParams.append('api_key', process.env.PUBMED_API_KEY || '');

    const fetchResponse = await fetch(fetchUrl.toString());
    const xmlText = await fetchResponse.text();

    // Parsear XML (usando regex simple para MVP)
    const results: PubMedResult[] = [];
    const articleRegex = /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g;
    const titleRegex = /<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/;
    const yearRegex = /<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/;
    const journalRegex = /<Journal>[\s\S]*?<Title>([\s\S]*?)<\/Title>/;
    const abstractRegex = /<AbstractText>([\s\S]*?)<\/AbstractText>/;

    let match;
    while ((match = articleRegex.exec(xmlText)) !== null) {
      const article = match[1];
      const titleMatch = titleRegex.exec(article || '');
      const yearMatch = yearRegex.exec(article || '');
      const journalMatch = journalRegex.exec(article || '');
      const abstractMatch = abstractRegex.exec(article || '');

      if (titleMatch?.[1] && yearMatch?.[1] && journalMatch?.[1]) {
        const pmid = pmids[results.length];
        results.push({
          title: titleMatch[1].replace(/<[^>]*>/g, ''),
          year: parseInt(yearMatch[1]),
          source: journalMatch[1].replace(/<[^>]*>/g, ''),
          url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
          abstract: abstractMatch?.[1]?.replace(/<[^>]*>/g, '') || undefined
        });
      }
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error('Error en búsqueda PubMed:', error);
    res.status(500).json({ message: 'Error al buscar en PubMed' });
  }
} 