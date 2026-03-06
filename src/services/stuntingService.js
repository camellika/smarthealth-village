"use server";

import prisma from "@/lib/prisma";

/*
Standar median tinggi badan WHO (perkiraan sederhana)
umur dalam bulan
*/

const tinggiMedian = {
  0: 49,
  6: 65,
  12: 75,
  24: 87,
  36: 96,
  48: 103,
  60: 110
};

const standarDeviasi = 3.5;

/*
Hitung umur dalam bulan
*/
function hitungUmurBulan(tglLahir, tanggalPeriksa) {
  const lahir = new Date(tglLahir);
  const periksa = new Date(tanggalPeriksa);

  const bulan =
    (periksa.getFullYear() - lahir.getFullYear()) * 12 +
    (periksa.getMonth() - lahir.getMonth());

  return bulan;
}

/*
Cari median tinggi terdekat
*/
function getMedianTinggi(umur) {

  let closest = 0;

  for (let key of Object.keys(tinggiMedian)) {
    if (umur >= key) {
      closest = key;
    }
  }

  return tinggiMedian[closest];
}

/*
Hitung Z Score
*/

function hitungZScore(tb, median) {
  return (tb - median) / standarDeviasi;
}

/*
Menentukan status stunting
*/

export function cekStunting(tb, umur) {

  const median = getMedianTinggi(umur);

  const z = hitungZScore(tb, median);

  if (z < -3) {
    return "Severely Stunted";
  }

  if (z < -2) {
    return "Stunted";
  }

  return "Normal";
}

/*
Cek status stunting dari riwayat posyandu
*/

export async function cekStuntingRiwayat(posyanduId) {

  const data = await prisma.posyanduBalita.findUnique({
    where: { id: Number(posyanduId) },
    include: {
      balita: true
    }
  });

  if (!data) {
    throw new Error("Data tidak ditemukan");
  }

  const umur = hitungUmurBulan(
    data.balita.tglLahir,
    data.tanggal
  );

  const status = cekStunting(data.tb, umur);

  return {
    nama: data.balita.nama,
    umurBulan: umur,
    tinggi: data.tb,
    statusStunting: status
  };
}